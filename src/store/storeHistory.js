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

  @observable
  testField = '';

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

  async goToPageAddToken() {
    const storeToken = (await import('./storeToken')).default;
    this.goToPageTransfer({
      token: storeToken.currentNativeToken,
    });
  }

  async goToPageTransfer({ token }) {
    const storeTransfer = (await import('./storeTransfer')).default;
    storeTransfer.fromToken = cloneDeep(token);
    this.push(ROUTE_TRANSFER);
  }

  async goToPageTokenDetail({ token }) {
    const storeToken = (await import('./storeToken')).default;
    storeToken.currentDetailToken = cloneDeep(token);
    this.push(ROUTE_TOKEN_DETAIL);
  }
}

global._storeHistory = new StoreHistory();
export default global._storeHistory;
