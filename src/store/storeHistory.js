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
  ROUTE_TOKEN_ADD,
  ROUTE_TOKEN_DETAIL,
  ROUTE_TRANSFER,
} from '../routes/routeUrls';
import BaseStore from './BaseStore';
import storeWallet from './storeWallet';

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

  openBrowserLink({ tx, account, token, block, ...others }) {
    const link = storeWallet.currentWallet.getBrowserLink({
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
