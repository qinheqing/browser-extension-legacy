import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import uiGetBgControllerAsync from '../wallets/bg/uiGetBgControllerAsync';
import { NOTIFICATION_NAMES } from '../../app/scripts/controllers/permissions/enums';
import BaseStore from './BaseStore';

class StoreApp extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    this.autosave('homeType');

    autorun(() => {
      const { homeType } = this;
      untracked(() => {
        if (homeType === 'NEW') {
          uiGetBgControllerAsync().then((bg) =>
            bg.disconnectAllDomainAccounts(),
          );
        }
      });
    });
  }

  // TODO showUserConfirmation show MM approve popup
  //      check homeType and return mock chainId=-1 address='1111'
  @observable
  homeType = 'OLD'; // NEW, OLD

  @observable
  legacyState = {
    isUnlocked: false,
    selectedAddress: '',
  };
}

global._storeApp = new StoreApp();
export default global._storeApp;
