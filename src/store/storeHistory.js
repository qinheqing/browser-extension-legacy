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
  ROUTE_HOME,
  ROUTE_HOME_OLD,
  ROUTE_TOKEN_ADD,
  ROUTE_TOKEN_DETAIL,
  ROUTE_TRANSFER,
} from '../routes/routeUrls';
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

  goBack() {
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

  async goToHomeNew() {
    const storeApp = (await import('./storeApp')).default;
    const storeStorage = (await import('./storeStorage')).default;
    const utilsToast = (await import('../utils/utilsToast')).default;

    if (storeApp.legacyState.hwOnlyMode) {
      utilsToast.toast.info('硬件设备暂不支持 Solana，请选择其他网络');
      return;
    }

    storeStorage.homeType = 'NEW';
    this.push(ROUTE_HOME);
  }

  async goToHomeOld() {
    const storeStorage = (await import('./storeStorage')).default;
    storeStorage.homeType = 'OLD';
    this.push(ROUTE_HOME_OLD);
  }

  async goToPageTokenAdd() {
    const storeToken = (await import('./storeToken')).default;
    this.push(ROUTE_TOKEN_ADD);
  }

  async goToPageTransfer({ token }) {
    const storeTransfer = (await import('./storeTransfer')).default;
    storeTransfer.fromToken = cloneDeep(token);
    this.push(ROUTE_TRANSFER);
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
