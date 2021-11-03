/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import uiDappApproval from '../wallets/dapp/uiDappApproval';
import utilsStorage from '../utils/utilsStorage';
import BaseStoreWithStorage from './BaseStoreWithStorage';

class StoreApproveSettings extends BaseStoreWithStorage {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  @observable.ref
  settings = {};

  @computed
  get settingsList() {
    return Object.keys(this.settings).map((origin) => {
      const { accounts, lastUpdate } = this.settings[origin];
      return {
        origin,
        lastUpdate,
        accounts,
      };
    });
  }

  async fetchSettings() {
    this.settings =
      (await utilsStorage.getAutoSaveStorageItemAsync({
        field: 'connections',
        namespace: utilsStorage.STORAGE_NAMESPACES.dappApproval,
      })) ?? {};
  }

  async deleteSetting({ origin, account }) {
    await uiDappApproval.removeAccountsConnection({ origin, account });
    await this.fetchSettings();
  }
}

global._storeApproveSettings = new StoreApproveSettings();
export default global._storeApproveSettings;
