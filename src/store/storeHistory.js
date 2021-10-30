/* eslint import/no-cycle: "warn" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { cloneDeep } from 'lodash';
import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_CREATE_ACCOUNT,
  ROUTE_HOME,
  ROUTE_HOME_OLD,
  ROUTE_TOKEN_ADD,
  ROUTE_TOKEN_DETAIL,
  ROUTE_TRANSFER,
} from '../routes/routeUrls';
import openStandalonePage from '../utils/openStandalonePage';
import { goToPageConnectHardware } from '../../ui/app/helpers/utils/util';
import utilsApp from '../utils/utilsApp';
import { NEW_ACCOUNT_ROUTE } from '../../ui/app/helpers/constants/routes';
import BaseStore from './BaseStore';

class StoreHistory extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  @observable.ref
  testField = '';

  // Route history
  get history() {
    return global.onekeyHistory;
  }

  push(url, ...others) {
    this.history.push(url, ...others);
  }

  replace(url, ...others) {
    this.history.replace(url, ...others);
  }

  goBack({ fallbackUrl } = {}) {
    if (fallbackUrl && window.history.length <= 1) {
      this.replace(fallbackUrl);
    }
    this.history.goBack();
  }

  goForward() {
    this.history.goForward();
  }

  go(num) {
    this.history.go(num);
  }

  replaceToHome() {
    this.replace(ROUTE_HOME);
  }

  async goToHomeNew({ chainKey, replace = false } = {}) {
    const storeApp = (await import('./storeApp')).default;
    const storeChain = (await import('./storeChain')).default;
    const storeStorage = (await import('./storeStorage')).default;
    const utilsToast = (await import('../utils/utilsToast')).default;

    storeStorage.homeType = 'NEW';

    if (chainKey) {
      storeChain.setCurrentChainKey(chainKey);
    }

    if (replace) {
      this.replace(ROUTE_HOME);
    } else {
      this.push(ROUTE_HOME);
    }
  }

  async goToHomeOld({ replace = false }) {
    const storeStorage = (await import('./storeStorage')).default;
    storeStorage.homeType = 'OLD';

    if (replace) {
      this.replace(ROUTE_HOME_OLD);
    } else {
      this.push(ROUTE_HOME_OLD);
    }
  }

  async goToPageCreateAccount({ chainKey } = {}) {
    if (utilsApp.isOldHome()) {
      this.push(NEW_ACCOUNT_ROUTE);
      return;
    }
    const storeAccount = (await import('./storeAccount')).default;
    const storeChain = (await import('./storeChain')).default;

    storeAccount.setAccountsGroupFilterToChain({
      chainKey: chainKey || storeChain.currentChainKey,
    });
    this.push(ROUTE_CREATE_ACCOUNT);
  }

  async goToPageConnectHardware({ chainKey } = {}) {
    if (utilsApp.isOldHome()) {
      goToPageConnectHardware();
      return;
    }
    const storeAccount = (await import('./storeAccount')).default;
    const storeChain = (await import('./storeChain')).default;

    storeAccount.setAccountsGroupFilterToChain({
      chainKey: chainKey || storeChain.currentChainKey,
    });
    openStandalonePage(ROUTE_CONNECT_HARDWARE);
  }

  async goToPageTokenAdd() {
    const storeToken = (await import('./storeToken')).default;
    const storeAccount = (await import('./storeAccount')).default;
    if (storeAccount.currentAccountTypeIsHardware) {
      openStandalonePage(ROUTE_TOKEN_ADD, 'HARDWARE_STANDALONE');
    } else {
      this.push(ROUTE_TOKEN_ADD);
    }
  }

  async goToPageTransfer({ token }) {
    const storeTransfer = (await import('./storeTransfer')).default;
    const storeAccount = (await import('./storeAccount')).default;

    storeTransfer.fromToken = cloneDeep(token);
    if (storeAccount.currentAccountTypeIsHardware) {
      openStandalonePage(ROUTE_TRANSFER, 'HARDWARE_STANDALONE');
    } else {
      this.push(ROUTE_TRANSFER);
    }
  }

  async goToPageTokenDetail({ token, replace = false }) {
    const storeToken = (await import('./storeToken')).default;
    storeToken.currentDetailToken = cloneDeep(token);
    replace ? this.replace(ROUTE_TOKEN_DETAIL) : this.push(ROUTE_TOKEN_DETAIL);
  }

  async openBlockBrowserLink({ wallet, tx, account, token, block, ...others }) {
    const storeWallet = (await import('./storeWallet')).default;
    // eslint-disable-next-line no-param-reassign
    wallet = wallet || storeWallet.currentWallet;
    const link = wallet.getBlockBrowserLink({
      tx,
      account,
      token,
      block,
      ...others,
    });
    window.open(link);
  }
}

global._storeHistory = new StoreHistory();
export default global._storeHistory;
