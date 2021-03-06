/**
 * @file The entry point for the web extension singleton process.
 */
// these need to run before anything else
/* eslint-disable import/first,import/order */
import setupFetchDebugging from './lib/setupFetchDebugging';
/* eslint-enable import/order */
/* eslint-disable */

setupFetchDebugging();

// polyfills
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

import endOfStream from 'end-of-stream';
import pump from 'pump';
import debounce from 'debounce-stream';
import log from '../../src/log/logger';
import extension from 'extensionizer';
import { storeAsStream, storeTransformStream } from '@onekeyhq/obs-store';
import PortStream from 'extension-port-stream';
import { captureException } from '@sentry/browser';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';

import {
  ENVIRONMENT_TYPE_POPUP,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_FULLSCREEN,
} from '../../shared/constants/app';
import migrations from './migrations';
import Migrator from './lib/migrator';
import ExtensionPlatform from './platforms/extension';
import LocalStore from './lib/local-store';
import ReadOnlyNetworkStore from './lib/network-store';
import createStreamSink from './lib/createStreamSink';
import NotificationManager from './lib/notification-manager';
import MetamaskController, {
  METAMASK_CONTROLLER_EVENTS,
} from './metamask-controller';
import rawFirstTimeState from './first-time-state';
import getFirstPreferredLangCode from './lib/get-first-preferred-lang-code';
import getObjStructure from './lib/getObjStructure';
import setupEnsIpfsResolver from './lib/ens-ipfs/setup';
import errorsGlobalHandler from './errorsGlobalHandler';
import backgroundSolana from '../../src/wallets/providers/SOL/dapp/background';
import backgroundContainer from './backgroundContainer';
import i18nBackground from './i18nBackground';
/* eslint-enable import/first */

const mboxReferences = {
  autorun,
  observer,
  name: 1,
};
global.$ok_extensionizer = extension;
global.ONEKEY_DISABLE_AUTO_PERSIST_DATA = false;
const { sentry } = global;
const firstTimeState = { ...rawFirstTimeState };

const platform = new ExtensionPlatform();
platform.clearCurrentTabsList();
// duplicate with [ global.METAMASK_NOTIFIER.platform ]
global.$ok_extensionPlatform = platform;
global.$ok_testThrowError = {
  randomError: () => {
    setTimeout(() => {
      throw new Error(`Error test: ${new Date().getTime()}`);
    }, 1000);
  },
  promiseCall: () => {
    setTimeout(() => window.ooooooPPPPPPqqqqqq(), 1000);
  },
  // TODO background normal error can NOT be handled by errorsGlobalHandler.js
  methodCall: () => window.aaaaaBBBBBccccccc(),
  customError1: () => {
    setTimeout(() => {
      throw new Error('BlockReEmitMiddleware - retries exhausted');
    }, 0);
  },
  customError2: () => {
    setTimeout(() => {
      throw new Error('BlockReEmitMiddleware - retries exhausted 111');
    }, 0);
  },
};
errorsGlobalHandler.init();

const notificationManager = new NotificationManager();
global.METAMASK_NOTIFIER = notificationManager;

let popupIsOpen = false;
let notificationIsOpen = false;
let uiIsTriggering = false;
const openMetamaskTabsIDs = {};
const requestAccountTabIds = {};

// state persistence
const inTest = process.env.IN_TEST === 'true';
const localStore = inTest ? new ReadOnlyNetworkStore() : new LocalStore();
let versionedData;

global.getCurrentLocale = () => {
  return i18nBackground.getCurrentLocale();
};

if (inTest || process.env.METAMASK_DEBUG) {
  // set global localStore for debug
  global.onekeyLocalStore = localStore;
  global.onekeyLocalStore_ENV_IN_TEST = process.env.IN_TEST;
  global.onekeyLocalStore.clear = async (callback) => {
    await localStore.set({ data: {}, meta: {} });
    try {
      await global.browser.storage.local.clear(); // firefox
    } catch (ex) {}
    try {
      await global.chrome.storage.local.clear(); // chrome
    } catch (ex) {}
    try {
      await extension.storage.local.clear(); // chrome
    } catch (ex) {}
    const currentStore = await localStore.get();
    console.log('currentStore=', JSON.stringify(currentStore, null, 2));
    console.log('Page will be reloaded in 3s...');
    setTimeout(() => {
      // eslint-disable-next-line node/callback-return
      callback && callback();
      setTimeout(() => {
        global.location.reload();
      }, 500);
    }, 2000);
  };
  global.metamaskGetState = localStore.get.bind(localStore);
}

// initialization flow
initialize().catch(log.error);

/**
 * An object representing a transaction, in whatever state it is in.
 * @typedef TransactionMeta
 *
 * @property {number} id - An internally unique tx identifier.
 * @property {number} time - Time the tx was first suggested, in unix epoch time (ms).
 * @property {string} status - The current transaction status (unapproved, signed, submitted, dropped, failed, rejected), as defined in `tx-state-manager.js`.
 * @property {string} metamaskNetworkId - The transaction's network ID, used for EIP-155 compliance.
 * @property {boolean} loadingDefaults - TODO: Document
 * @property {Object} txParams - The tx params as passed to the network provider.
 * @property {Object[]} history - A history of mutations to this TransactionMeta object.
 * @property {string} origin - A string representing the interface that suggested the transaction.
 * @property {Object} nonceDetails - A metadata object containing information used to derive the suggested nonce, useful for debugging nonce issues.
 * @property {string} rawTx - A hex string of the final signed transaction, ready to submit to the network.
 * @property {string} hash - A hex string of the transaction hash, used to identify the transaction on the network.
 * @property {number} submittedTime - The time the transaction was submitted to the network, in Unix epoch time (ms).
 */

/**
 * The data emitted from the MetaMaskController.store EventEmitter, also used to initialize the MetaMaskController. Available in UI on React state as state.metamask.
 * @typedef MetaMaskState
 * @property {boolean} isInitialized - Whether the first vault has been created.
 * @property {boolean} isUnlocked - Whether the vault is currently decrypted and accounts are available for selection.
 * @property {boolean} isAccountMenuOpen - Represents whether the main account selection UI is currently displayed.
 * @property {Object} identities - An object matching lower-case hex addresses to Identity objects with "address" and "name" (nickname) keys.
 * @property {Object} unapprovedTxs - An object mapping transaction hashes to unapproved transactions.
 * @property {Array} frequentRpcList - A list of frequently used RPCs, including custom user-provided ones.
 * @property {Array} addressBook - A list of previously sent to addresses.
 * @property {Object} contractExchangeRates - Info about current token prices.
 * @property {Array} tokens - Tokens held by the current user, including their balances.
 * @property {Object} send - TODO: Document
 * @property {boolean} useBlockie - Indicates preferred user identicon format. True for blockie, false for Jazzicon.
 * @property {Object} featureFlags - An object for optional feature flags.
 * @property {boolean} welcomeScreen - True if welcome screen should be shown.
 * @property {string} currentLocale - A locale string matching the user's preferred display language.
 * @property {Object} provider - The current selected network provider.
 * @property {string} provider.rpcUrl - The address for the RPC API, if using an RPC API.
 * @property {string} provider.type - An identifier for the type of network selected, allows MetaMask to use custom provider strategies for known networks.
 * @property {string} network - A stringified number of the current network ID.
 * @property {Object} accounts - An object mapping lower-case hex addresses to objects with "balance" and "address" keys, both storing hex string values.
 * @property {hex} currentBlockGasLimit - The most recently seen block gas limit, in a lower case hex prefixed string.
 * @property {TransactionMeta[]} currentNetworkTxList - An array of transactions associated with the currently selected network.
 * @property {Object} unapprovedMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedMsgCount - The number of messages in unapprovedMsgs.
 * @property {Object} unapprovedPersonalMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedPersonalMsgCount - The number of messages in unapprovedPersonalMsgs.
 * @property {Object} unapprovedEncryptionPublicKeyMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedEncryptionPublicKeyMsgCount - The number of messages in EncryptionPublicKeyMsgs.
 * @property {Object} unapprovedDecryptMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedDecryptMsgCount - The number of messages in unapprovedDecryptMsgs.
 * @property {Object} unapprovedTypedMsgs - An object of messages pending approval, mapping a unique ID to the options.
 * @property {number} unapprovedTypedMsgCount - The number of messages in unapprovedTypedMsgs.
 * @property {number} pendingApprovalCount - The number of pending request in the approval controller.
 * @property {string[]} keyringTypes - An array of unique keyring identifying strings, representing available strategies for creating accounts.
 * @property {Keyring[]} keyrings - An array of keyring descriptions, summarizing the accounts that are available for use, and what keyrings they belong to.
 * @property {string} selectedAddress - A lower case hex string of the currently selected address.
 * @property {string} currentCurrency - A string identifying the user's preferred display currency, for use in showing conversion rates.
 * @property {number} conversionRate - A number representing the current exchange rate from the user's preferred currency to Ether.
 * @property {number} conversionDate - A unix epoch date (ms) for the time the current conversion rate was last retrieved.
 * @property {boolean} forgottenPassword - Returns true if the user has initiated the password recovery screen, is recovering from seed phrase.
 */

/**
 * @typedef VersionedData
 * @property {MetaMaskState} data - The data emitted from MetaMask controller, or used to initialize it.
 * @property {Number} version - The latest migration version that has been run.
 */

/**
 * Initializes the MetaMask controller, and sets up all platform configuration.
 * @returns {Promise} Setup complete.
 */
async function initialize() {
  const initState = await loadStateFromPersistence();
  const initLangCode = await getFirstPreferredLangCode();
  await i18nBackground.init(
    initState?.PreferencesController?.currentLocale || initLangCode,
  );

  await setupController(initState, initLangCode);
  log.debug('OneKey initialization complete.');
}

//
// State and Persistence
//

/**
 * Loads any stored data, prioritizing the latest storage strategy.
 * Migrates that data schema in case it was last loaded on an older version.
 * @returns {Promise<MetaMaskState>} Last data emitted from previous instance of MetaMask.
 */
async function loadStateFromPersistence() {
  // migrations
  const migrator = new Migrator({ migrations });
  migrator.on('error', console.warn);

  // read from disk
  // first from preferred, async API:
  versionedData =
    (await localStore.get()) || migrator.generateInitialState(firstTimeState);

  // check if somehow state is empty
  // this should never happen but new error reporting suggests that it has
  // for a small number of users
  // https://github.com/metamask/metamask-extension/issues/3919
  if (versionedData && !versionedData.data) {
    // unable to recover, clear state
    versionedData = migrator.generateInitialState(firstTimeState);
    sentry.captureMessage('OneKey - Empty vault found - unable to recover');
  }

  // report migration errors to sentry
  migrator.on('error', (err) => {
    // get vault structure without secrets
    const vaultStructure = getObjStructure(versionedData);
    sentry.captureException(err, {
      // "extra" key is required by Sentry
      extra: { vaultStructure },
    });
  });

  // migrate data
  versionedData = await migrator.migrateData(versionedData);
  if (!versionedData) {
    throw new Error('MetaMask - migrator returned undefined');
  }

  // write to disk
  if (localStore.isSupported) {
    // MUST only update {data,meta} field defined by MM, Otherwise it will overwrite fields defined elsewhere
    const { data, meta } = versionedData;
    localStore.set({ data, meta });
  } else {
    // throw in setTimeout so as to not block boot
    setTimeout(() => {
      throw new Error('MetaMask - Localstore not supported');
    });
  }

  // return just the data
  return versionedData.data;
}

/**
 * Initializes the MetaMask Controller with any initial state and default language.
 * Configures platform-specific error reporting strategy.
 * Streams emitted state updates to platform-specific storage strategy.
 * Creates platform listeners for new Dapps/Contexts, and sets up their data connections to the controller.
 *
 * @param {Object} initState - The initial state to start the controller with, matches the state that is emitted from the controller.
 * @param {string} initLangCode - The region code for the language preferred by the current user.
 * @returns {Promise} After setup is complete.
 */
function setupController(initState, initLangCode) {
  //
  // MetaMask Controller
  //

  const controller = new MetamaskController({
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    // User confirmation callbacks:
    showUserConfirmation: triggerUi,
    openPopup,
    // initial state
    initState,
    // initial locale code
    initLangCode,
    // platform specific api
    platform,
    extension,
    getRequestAccountTabIds: () => {
      return requestAccountTabIds;
    },
    getOpenMetamaskTabsIds: () => {
      return openMetamaskTabsIDs;
    },
  });

  backgroundContainer.setRootController(controller);
  global.$ok_isUnlockedCheck = controller.isUnlocked.bind(controller);

  if (inTest || process.env.METAMASK_DEBUG) {
    global.$ok_metamaskController = controller;
  }

  setupEnsIpfsResolver({
    getCurrentChainId: controller.networkController.getCurrentChainId.bind(
      controller.networkController,
    ),
    getIpfsGateway: controller.preferencesController.getIpfsGateway.bind(
      controller.preferencesController,
    ),
    provider: controller.provider,
  });

  // setup state persistence
  pump(
    storeAsStream(controller.store),
    debounce(1000),
    storeTransformStream(versionifyData),
    createStreamSink(persistData),
    (error) => {
      log.error('MetaMask - Persistence pipeline failed', error);
    },
  );

  /**
   * Assigns the given state to the versioned object (with metadata), and returns that.
   * @param {Object} state - The state object as emitted by the MetaMaskController.
   * @returns {VersionedData} The state object wrapped in an object that includes a metadata key.
   */
  function versionifyData(state) {
    versionedData.data = state;
    return versionedData;
  }

  let dataPersistenceFailing = false;

  async function persistData(state) {
    if (global.ONEKEY_DISABLE_AUTO_PERSIST_DATA) {
      return;
    }
    if (!state) {
      throw new Error('MetaMask - updated state is missing');
    }
    if (!state.data) {
      throw new Error('MetaMask - updated state does not have data');
    }
    if (localStore.isSupported) {
      try {
        // MUST only update {data,meta} field defined by MM, Otherwise it will overwrite fields defined elsewhere
        const { data, meta } = state;
        await localStore.set({ data, meta });
        if (dataPersistenceFailing) {
          dataPersistenceFailing = false;
        }
      } catch (err) {
        // log error so we dont break the pipeline
        if (!dataPersistenceFailing) {
          dataPersistenceFailing = true;
          captureException(err);
        }
        log.error('error setting state in local store:', err);
      }
    }
  }

  //
  // connect to other contexts
  //
  extension.runtime.onConnect.addListener(connectRemote);
  extension.runtime.onConnectExternal.addListener(connectExternal);

  const metamaskInternalProcessHash = {
    [ENVIRONMENT_TYPE_POPUP]: true,
    [ENVIRONMENT_TYPE_NOTIFICATION]: true,
    [ENVIRONMENT_TYPE_FULLSCREEN]: true,
  };

  const metamaskBlockedPorts = ['trezor-connect'];

  const isClientOpenStatus = () => {
    return (
      popupIsOpen ||
      Boolean(Object.keys(openMetamaskTabsIDs).length) ||
      notificationIsOpen
    );
  };

  /**
   * A runtime.Port object, as provided by the browser:
   * @see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/Port
   * @typedef Port
   * @type Object
   */

  /**
   * Connects a Port to the MetaMask controller via a multiplexed duplex stream.
   * This method identifies trusted (MetaMask) interfaces, and connects them differently from untrusted (web pages).
   * @param {Port} remotePort - The port provided by a new context.
   */
  function connectRemote(remotePort) {
    const processName = remotePort.name;
    const isMetaMaskInternalProcess = metamaskInternalProcessHash[processName];

    if (metamaskBlockedPorts.includes(remotePort.name)) {
      return;
    }

    if (isMetaMaskInternalProcess) {
      const portStream = new PortStream(remotePort);
      // communication with popup
      controller.isClientOpen = true;
      controller.setupTrustedCommunication(portStream, remotePort.sender);

      if (processName === ENVIRONMENT_TYPE_POPUP) {
        popupIsOpen = true;

        endOfStream(portStream, () => {
          popupIsOpen = false;
          controller.isClientOpen = isClientOpenStatus();
        });
      }

      if (processName === ENVIRONMENT_TYPE_NOTIFICATION) {
        notificationIsOpen = true;

        endOfStream(portStream, () => {
          notificationIsOpen = false;
          controller.isClientOpen = isClientOpenStatus();
        });
      }

      if (processName === ENVIRONMENT_TYPE_FULLSCREEN) {
        const tabId = remotePort.sender.tab.id;
        openMetamaskTabsIDs[tabId] = true;

        endOfStream(portStream, () => {
          delete openMetamaskTabsIDs[tabId];
          controller.isClientOpen = isClientOpenStatus();
        });
      }
    } else {
      if (remotePort.sender && remotePort.sender.tab && remotePort.sender.url) {
        const tabId = remotePort.sender.tab.id;
        const url = new URL(remotePort.sender.url);
        const { origin } = url;

        remotePort.onMessage.addListener((msg) => {
          if (msg.data && msg.data.method === 'eth_requestAccounts') {
            requestAccountTabIds[origin] = tabId;
          }
        });
      }
      connectExternal(remotePort);
    }
  }

  // communication with page or other extension
  function connectExternal(remotePort) {
    const portStream = new PortStream(remotePort);
    controller.setupUntrustedCommunication(portStream, remotePort.sender);
  }

  //
  // User Interface setup
  //

  updateBadge();
  controller.txController.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.messageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.personalMessageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.decryptMessageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.encryptionPublicKeyManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.typedMessageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.approvalController.subscribe(updateBadge);
  controller.appStateController.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );

  /**
   * Updates the Web Extension's "badge" number, on the little fox in the toolbar.
   * The number reflects the current number of pending transactions or message signatures needing user approval.
   */
  function updateBadge() {
    let label = '';
    const unapprovedTxCount = controller.txController.getUnapprovedTxCount();
    const { unapprovedMsgCount } = controller.messageManager;
    const { unapprovedPersonalMsgCount } = controller.personalMessageManager;
    const { unapprovedDecryptMsgCount } = controller.decryptMessageManager;
    const { unapprovedEncryptionPublicKeyMsgCount } =
      controller.encryptionPublicKeyManager;
    const { unapprovedTypedMessagesCount } = controller.typedMessageManager;
    const pendingApprovalCount =
      controller.approvalController.getTotalApprovalCount();
    const waitingForUnlockCount =
      controller.appStateController.waitingForUnlock.length;
    const count =
      unapprovedTxCount +
      unapprovedMsgCount +
      unapprovedPersonalMsgCount +
      unapprovedDecryptMsgCount +
      unapprovedEncryptionPublicKeyMsgCount +
      unapprovedTypedMessagesCount +
      pendingApprovalCount +
      waitingForUnlockCount;
    if (count) {
      label = String(count);
    }
    extension.browserAction.setBadgeText({ text: label });
    extension.browserAction.setBadgeBackgroundColor({ color: '#037DD6' });
  }

  return Promise.resolve();
}

//
// Etc...
//

/**
 * Opens the browser popup for user confirmation
 */
async function triggerUi(url = '') {
  const tabs = await platform.getActiveTabs();
  const currentlyActiveMetamaskTab = Boolean(
    tabs.find((tab) => openMetamaskTabsIDs[tab.id]),
  );
  // Vivaldi is not closing port connection on popup close, so popupIsOpen does not work correctly
  // To be reviewed in the future if this behaviour is fixed - also the way we determine isVivaldi variable might change at some point
  const isVivaldi =
    tabs.length > 0 &&
    tabs[0].extData &&
    tabs[0].extData.indexOf('vivaldi_tab') > -1;
  if (
    !uiIsTriggering &&
    (isVivaldi || !popupIsOpen) &&
    !currentlyActiveMetamaskTab
  ) {
    uiIsTriggering = true;
    try {
      await notificationManager.showPopup(url);
    } finally {
      uiIsTriggering = false;
    }
  }
}

/**
 * Opens the browser popup for user confirmation of watchAsset
 * then it waits until user interact with the UI
 */
async function openPopup(url = '', { waitClose = true } = {}) {
  await triggerUi(url);
  // wait for popup window closed by any action with the UI
  //      like confirm approve, cancel approve, close window
  if (waitClose) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!notificationIsOpen) {
          clearInterval(interval);
          resolve();
          log.info('openPopup wait close done: ' + url);
        }
      }, 1000);
    });
  } else {
    log.info('openPopup: ' + url);
  }
}

async function openApprovalPopup(
  { baseChain = '', request = {}, key } = {},
  { waitClose = false, ...others } = {},
) {
  const searchParams = new URLSearchParams();
  // searchParams.set('origin', sender.origin);
  // searchParams.set('networkId', message.data.params.network);
  // searchParams.set('chainId', message.data.params.chainId);
  searchParams.set('request', JSON.stringify(request));
  searchParams.set('key', key);
  return openPopup(
    `/app/approve-popup/${baseChain.toLowerCase()}?${searchParams.toString()}`,
    {
      waitClose,
      ...others,
    },
  );
}

// On first install, open a new tab with MetaMask
extension.runtime.onInstalled.addListener(({ reason }) => {
  if (
    reason === 'install' &&
    !(process.env.METAMASK_DEBUG || process.env.IN_TEST)
  ) {
    platform.openExtensionInBrowser();
  }
});

// $ok_openPopup('/app/approve-popup/')
global.$ok_openPopup = openPopup;
global.$ok_openApprovalPopup = openApprovalPopup;
global.$ok_triggerUi = triggerUi;
backgroundSolana.init();
