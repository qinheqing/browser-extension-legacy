/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import uiGetBgControllerAsync from '../wallets/bg/uiGetBgControllerAsync';
import {
  getBackgroundInstanceAsync,
  forceUpdateMetamaskState,
  getStore,
} from '../../ui/app/store/actions';
import { UNLOCK_ROUTE } from '../../ui/app/helpers/constants/routes';
import BaseStore from './BaseStore';
import storeStorage from './storeStorage';
import storeHistory from './storeHistory';

class StoreApp extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    autorun(() => {
      const { homeType } = storeStorage;
      untracked(() => {
        uiGetBgControllerAsync().then((bg) => {
          if (homeType === 'NEW') {
            bg.disconnectAllDomainAccounts();
          } else {
            bg.emitAccountChangedToConnectedDomain(
              this.legacyState.selectedAddress,
            );
          }
          bg.notifyChainIdChanged();
        });
      });
    });
  }

  @computed
  get homeType() {
    return storeStorage.homeType;
  }

  @computed
  get isNewHome() {
    return this.homeType === 'NEW';
  }

  toggleAssetBalanceVisible() {
    storeStorage.maskAssetBalance = !storeStorage.maskAssetBalance;
  }

  async lockScreen() {
    const bg = await getBackgroundInstanceAsync();
    const store = getStore();
    await bg.setLocked();
    await forceUpdateMetamaskState(store?.dispatch);
    storeHistory.push(UNLOCK_ROUTE);
  }

  @observable
  legacyState = {
    isUnlocked: false,
    selectedAddress: '',
    hwOnlyMode: false,
  };
}

global._storeApp = new StoreApp();
export default global._storeApp;
