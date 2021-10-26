import extension from 'extensionizer';
import { getEnvironmentType, checkForError } from '../lib/util';
import { ENVIRONMENT_TYPE_BACKGROUND } from '../../../shared/constants/app';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';
import { getBlockExplorerUrlForTx } from '../../../ui/app/helpers/utils/transactions.util';
import utilsStorage from '../../../src/utils/utilsStorage';

const CURRENT_TABS_LIST = 'CURRENT_TABS_LIST';

export default class ExtensionPlatform {
  //
  // Public
  //
  reload() {
    extension.runtime.reload();
  }

  targets = {};

  openTab(options, target) {
    return new Promise((resolve, reject) => {
      const createNewTab = () => {
        extension.tabs.create(options, (newTab) => {
          if (target) {
            this.targets[target] = newTab.id;
          }
          const error = checkForError();
          if (error) {
            return reject(error);
          }
          return resolve(newTab);
        });
      };
      const tabId = this.targets[target];
      if (tabId) {
        this.getTabById(tabId)
          .then(() => {
            this.updateTab(tabId, { highlighted: true, ...options })
              .then(resolve)
              .catch(reject);
          })
          // eslint-disable-next-line node/handle-callback-err
          .catch((err) => {
            delete this.targets[target];
            createNewTab();
          });
      } else {
        createNewTab();
      }
    });
  }

  openWindow(options) {
    return new Promise((resolve, reject) => {
      extension.windows.create(options, (newWindow) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  focusWindow(windowId, options) {
    return new Promise((resolve, reject) => {
      extension.windows.update(
        windowId,
        {
          drawAttention: true, // no effect if the window already has focus
          focused: true,
          ...options,
        },
        () => {
          const error = checkForError();
          if (error) {
            return reject(error);
          }
          return resolve();
        },
      );
    });
  }

  updateWindowPosition(windowId, left, top) {
    return new Promise((resolve, reject) => {
      extension.windows.update(windowId, { left, top }, () => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  getLastFocusedWindow() {
    return new Promise((resolve, reject) => {
      extension.windows.getLastFocused((windowObject) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windowObject);
      });
    });
  }

  closeCurrentWindow() {
    return extension.windows.getCurrent((windowDetails) => {
      return extension.windows.remove(windowDetails.id);
    });
  }

  getWindow(windowId, queryOptions = {}) {
    return new Promise((resolve, reject) => {
      extension.windows.get(windowId, queryOptions, (windowObject) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windowObject);
      });
    });
  }

  getVersion() {
    return extension.runtime.getManifest().version;
  }

  openExtensionInBrowser(route = null, queryString = null, target = '') {
    let extensionURL = extension.runtime.getURL('home.html');

    if (queryString) {
      extensionURL += `?${queryString}`;
    }

    if (route) {
      extensionURL += `#${route}`;
    }
    this.openTab({ url: extensionURL }, target);
    if (getEnvironmentType() !== ENVIRONMENT_TYPE_BACKGROUND) {
      window.close();
    }
  }

  getPlatformInfo(cb) {
    try {
      extension.runtime.getPlatformInfo((platform) => {
        cb(null, platform);
      });
    } catch (e) {
      cb(e);
      // eslint-disable-next-line no-useless-return
      return;
    }
  }

  showTransactionNotification(txMeta, rpcPrefs = {}) {
    const { status, txReceipt: { status: receiptStatus } = {} } = txMeta;

    if (status === TRANSACTION_STATUSES.CONFIRMED) {
      // There was an on-chain failure
      receiptStatus === '0x0'
        ? this._showFailedTransaction(
            txMeta,
            'Transaction encountered an error.',
          )
        : this._showConfirmedTransaction(txMeta, rpcPrefs);
    } else if (status === TRANSACTION_STATUSES.FAILED) {
      this._showFailedTransaction(txMeta);
    }
  }

  getAllWindows() {
    return new Promise((resolve, reject) => {
      extension.windows.getAll((windows) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windows);
      });
    });
  }

  getTabsInWindow(windowId) {
    return this.getTabs({ windowId });
  }

  // https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
  getTabs(queryInfo) {
    return new Promise((resolve, reject) => {
      extension.tabs.query(queryInfo, (tabs) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(tabs);
      });
    });
  }

  getTabById(tabId) {
    return new Promise((resolve, reject) => {
      extension.tabs.get(tabId, (tab) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(tab);
      });
    });
  }

  getAllTabs() {
    return this.getTabs({});
  }

  getActiveTabs() {
    return new Promise((resolve, reject) => {
      extension.tabs.query({ active: true }, (tabs) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(tabs);
      });
    });
  }

  currentTab() {
    return new Promise((resolve, reject) => {
      extension.tabs.getCurrent((tab) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(tab);
        }
      });
    });
  }

  switchToTab(tabId) {
    return new Promise((resolve, reject) => {
      extension.tabs.update(tabId, { highlighted: true }, (tab) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(tab);
        }
      });
    });
  }

  updateTab(tabId, updateInfo) {
    return new Promise((resolve, reject) => {
      // https://developer.chrome.com/docs/extensions/reference/tabs/#method-update
      extension.tabs.update(tabId, updateInfo, (tab) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(tab);
        }
      });
    });
  }

  closeTab(tabId) {
    return new Promise((resolve, reject) => {
      extension.tabs.remove(tabId, () => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  closeAllSavedTabs({ ignoreSelf = true } = {}) {
    const tabsList = utilsStorage.getItem(CURRENT_TABS_LIST) || {};
    extension.tabs.getCurrent((tab) => {
      const currentTabId = tab?.id;
      Object.keys(tabsList).forEach((tabId) => {
        const tabIdInt = parseInt(tabId, 10);
        if (isNaN(tabIdInt)) {
          return;
        }

        if (ignoreSelf && tabIdInt === currentTabId) {
          return;
        }

        this._updateTabIdToStorage(tabIdInt, false);
        this.closeTab(tabIdInt).catch((err) => {
          console.error(err);
          // noop
        });
      });
    });
  }

  clearCurrentTabsList() {
    utilsStorage.setItem(CURRENT_TABS_LIST, {});
  }

  saveCurrentTabId() {
    return this._updateCurrentTabIdToStorage(true);
  }

  removeCurrentTabId() {
    return this._updateCurrentTabIdToStorage(false);
  }

  _updateTabIdToStorage(tabId, value = false) {
    const tabsList = utilsStorage.getItem(CURRENT_TABS_LIST) || {};
    const newTabsList = {
      ...tabsList,
      [tabId]: value,
    };
    if (!value) {
      delete newTabsList[tabId];
    }
    utilsStorage.setItem(CURRENT_TABS_LIST, newTabsList);
  }

  _updateCurrentTabIdToStorage(value = true) {
    return new Promise((resolve, reject) => {
      extension.tabs.getCurrent((tab) => {
        if (tab && tab.id) {
          this._updateTabIdToStorage(tab.id, value);
          resolve(tab);
        }
        const err = checkForError();
        if (err) {
          reject(err);
        }
      });
    });
  }

  _showConfirmedTransaction(txMeta, rpcPrefs = {}) {
    this._subscribeToNotificationClicked();

    const url = getBlockExplorerUrlForTx(txMeta, rpcPrefs);
    const nonce = parseInt(txMeta.txParams.nonce, 16);

    const title = 'Confirmed transaction';
    const message = `Transaction ${nonce} confirmed! ${
      url.length ? 'View on Etherscan' : ''
    }`;
    this._showNotification(title, message, url);
  }

  _showFailedTransaction(txMeta, errorMessage) {
    const nonce = parseInt(txMeta.txParams.nonce, 16);
    const title = 'Failed transaction';
    const message = `Transaction ${nonce} failed! ${
      errorMessage || txMeta.err.message
    }`;
    this._showNotification(title, message);
  }

  _showNotification(title, message, url) {
    extension.notifications.create(url, {
      type: 'basic',
      title,
      iconUrl: extension.extension.getURL('../../images/icon-64.png'),
      message,
    });
  }

  _subscribeToNotificationClicked() {
    if (!extension.notifications.onClicked.hasListener(this._viewOnEtherscan)) {
      extension.notifications.onClicked.addListener(this._viewOnEtherscan);
    }
  }

  _viewOnEtherscan(txId) {
    if (txId.startsWith('https://')) {
      extension.tabs.create({ url: txId });
    }
  }
}
