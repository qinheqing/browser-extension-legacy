import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { merge } from 'lodash';
import { Semaphore } from 'async-mutex';
import BaseStore from './BaseStore';

class StoreBalance extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    // TODO rename allBalanceRaw
    this.autosave('currentBalanceRaw');
  }

  balanceFetchSemaphore = new Semaphore(1);

  @observable
  currentBalanceRaw = {
    // key: { balance, decimals, lastUpdate }
  };

  // TODO throttle, auto remove some very old records
  @action.bound
  updateTokenBalance(key, { balance, decimals, ...others } = {}) {
    if (key) {
      // use merge() DO NOT handle undefined value
      const newInfo = merge({}, this.currentBalanceRaw[key], {
        balance,
        decimals,
        ...others,
        lastUpdate: new Date().getTime(),
      });
      this.currentBalanceRaw[key] = newInfo;
    }
  }

  getBalanceInfoCacheByKey(key) {
    const { balance, decimals, lastUpdate, ...others } =
      this.currentBalanceRaw[key] || {};
    return { balance, decimals, lastUpdate, ...others };
  }

  async fetchBalanceInfo({ wallet, address }) {
    const { balance, decimals, ...others } =
      // TODO cancel pending balance request if component destroy
      await this.balanceFetchSemaphore.runExclusive(async (semaphoreValue) => {
        return await wallet.chainProvider.getAccountInfo({ address });
      });
    // TODO update cache balance here
    return { balance, decimals, ...others };
  }
}

global._storeBalance = new StoreBalance();
export default global._storeBalance;
