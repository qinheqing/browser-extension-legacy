import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { merge } from 'lodash';
import BaseStore from './BaseStore';

class StoreBalance extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    this.autosave('currentBalanceRaw');
  }

  @observable
  currentBalanceRaw = {
    // key: { balance, decimals }
  };

  // TODO throttle
  updateTokenBalance(key, { balance, decimals } = {}) {
    if (key) {
      // use merge() DO NOT handle undefined value
      const newInfo = merge({}, this.currentBalanceRaw[key], {
        balance,
        decimals,
      });
      this.currentBalanceRaw[key] = newInfo;
    }
  }

  getBalanceInfoByKey(key) {
    const { balance, decimals } = this.currentBalanceRaw[key] || {};
    return { balance, decimals };
  }
}

global._storeBalance = new StoreBalance();
export default global._storeBalance;
