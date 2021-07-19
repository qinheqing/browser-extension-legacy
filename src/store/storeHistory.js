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
import utilsToast from '../utils/utilsToast';
import BaseStore from './BaseStore';
import storeWallet from './storeWallet';
import storeStorage from './storeStorage';

class StoreHistory extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  @observable
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

    if (storeApp.legacyState.hwOnlyMode) {
      utilsToast.toast.info('设备暂不支持 Solana，请选择其他网络');
      return;
    }

    storeStorage.homeType = 'NEW';
    this.push(ROUTE_HOME);
  }

  goToHomeOld() {
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

  openBlockBrowserLink({ tx, account, token, block, ...others }) {
    const link = storeWallet.currentWallet.getBlockBrowserLink({
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
