// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
let __define;

/**
 * Caches reference to global define object and deletes it to
 * avoid conflicts with other global define objects, such as
 * AMD's define function
 */
const cleanContextForImports = () => {
  __define = global.define;
  try {
    global.define = undefined;
  } catch (_) {
    console.warn('MetaMask - global.define could not be deleted.');
  }
};

/**
 * Restores global define object from cached reference
 */
const restoreContextAfterImports = () => {
  try {
    global.define = __define;
  } catch (_) {
    console.warn('MetaMask - global.define could not be overwritten.');
  }
};

cleanContextForImports();

/* eslint-disable import/first */
import { WindowPostMessageStream } from '@onekeyhq/post-message-stream';
import {
  initializeProvider,
  shimWeb3,
  setGlobalProvider,
} from '@onekeyhq/providers';
import log from '../../src/log/logger';
import inpageSolana from '../../src/wallets/providers/SOL/dapp/inpage';
import inpageConflux from '../../src/wallets/providers/CFX/dapp/inpage';
import {
  STREAM_CONTENT_SCRIPT,
  STREAM_INPAGE,
  STREAM_PROVIDER_ETH,
  STREAM_PROVIDER_CFX,
} from './constants/consts';
import inpageConflict from './inpageConflict';
// import inpageSolanaLegacy from '../../src/wallets/SOL/dapp/inpageSolanaLegacy';

restoreContextAfterImports();

//
// setup plugin communication
//

// setup background connection
const metamaskStream = new WindowPostMessageStream({
  name: STREAM_INPAGE,
  target: STREAM_CONTENT_SCRIPT,
});

const version =
  global.onekeyAppVersionInfo?.versionFull ||
  global.onekeyAppVersionInfo?.version ||
  '';

// ETH provider ----------------------------------------------
const providerEth = initializeProvider({
  connectionStream: metamaskStream,
  jsonRpcStreamName: STREAM_PROVIDER_ETH,
  logger: log,
  shouldShimWeb3: false, // manually set window.ethereum by setGlobalProvider()
  shouldSetOnWindow: false, // manually shimWeb3 by shimWeb3()
});
providerEth.version = version;
inpageConflict.resolveConflict({ provider: providerEth });

// SOL provider ----------------------------------------------
const providerSolana = inpageSolana.init();
providerSolana.version = version;
// inpageSolanaLegacy.init();

// CFX provider ----------------------------------------------
const providerConflux = initializeProvider({
  connectionStream: metamaskStream,
  jsonRpcStreamName: STREAM_PROVIDER_CFX,
  logger: log,
  shouldShimWeb3: false, // manually set window.ethereum by setGlobalProvider()
  shouldSetOnWindow: false, // manually shimWeb3 by shimWeb3()
});
providerConflux.version = version;
inpageConflux.init({ provider: providerConflux });
