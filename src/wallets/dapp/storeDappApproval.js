/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { uniqBy } from 'lodash';
import BaseStoreWithStorage from '../../store/BaseStoreWithStorage';
import backgroundProxy from '../bg/backgroundProxy';
import utilsStorage from '../../utils/utilsStorage';

class StoreDappApproval extends BaseStoreWithStorage {
  // TODO ensure this store run in background
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
    this.autosave('connections');
  }

  @observable.ref
  connections = {
    // [origin]: [ { address, baseChain, chainKey, origin } ]
  };

  async getUiStorageItem(key) {
    const storageKey = utilsStorage.buildAutoSaveStorageKey(
      key,
      utilsStorage.STORAGE_NS_UI,
    );
    const value = await this.getStorageItemAsync(storageKey);
    return value;
  }

  async getCurrentAccountRaw() {
    return this.getUiStorageItem('currentAccountRaw');
  }

  @action.bound
  async saveAccounts({ baseChain, chainKey, origin, accounts }) {
    const currentAccounts = this.connections[origin] || [];
    const appendAccounts = accounts.map((address) => {
      return {
        address,
        baseChain,
        chainKey,
        origin,
      };
    });
    const newAccounts = uniqBy(
      [].concat(currentAccounts, appendAccounts),
      (item) => item.address + item.baseChain + (item.chainKey || ''),
    );
    this.connections = {
      ...this.connections,
      [origin]: newAccounts,
    };
  }

  async requestAccounts({ request, baseChain, chainKey, origin }) {
    let accounts = await this.getAccounts({ baseChain, chainKey, origin });
    if (accounts?.length) {
      return accounts;
    }
    accounts = await this.openApprovalPopup(request);
    await this.saveAccounts({
      baseChain,
      chainKey,
      origin,
      accounts,
    });
    // TODO emit accounts change
    return accounts;
  }

  async getAccounts({ baseChain, chainKey, origin }) {
    const currentAccount = await this.getCurrentAccountRaw();
    if (!currentAccount) {
      return [];
    }
    const allAccounts = this.connections[origin] || [];
    return allAccounts
      .filter((acc) => {
        let found = acc.baseChain === baseChain;
        if (acc.chainKey && chainKey) {
          found = found && chainKey === acc.chainKey;
        }
        return found;
      })
      .filter((acc) => {
        return (
          acc.baseChain === currentAccount.baseChain &&
          acc.address === currentAccount.address
        );
      })
      .map((acc) => acc.address);
    // TODO emit accounts change
  }

  async openApprovalPopup(request) {
    return new Promise((resolve, reject) => {
      const { origin, baseChain } = request;
      if (!baseChain) {
        throw new Error(
          'openApprovalPopup error: request.baseChain not defined',
        );
      }
      const key = backgroundProxy.dappApprovalMethods.saveApproval({
        baseChain,
        origin,
        resolve,
        reject,
      });
      global.$ok_openApprovalPopup({
        baseChain,
        request,
        key,
      });
    });
  }
}

global._storeDappApproval = new StoreDappApproval({
  shouldRunInBackground: true,
});
export default global._storeDappApproval;
