/* eslint import/no-cycle: "error" */
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
import storeStorage from './storeStorage';

class StoreBalance extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  balanceFetchSemaphore = new Semaphore(1);

  // TODO throttle, auto remove some very old records
  @action.bound
  updateTokenBalance(key, { balance, decimals, ...others } = {}) {
    if (key) {
      // use merge() DO NOT handle undefined value
      const newInfo = merge({}, storeStorage.currentBalanceRaw[key], {
        balance,
        decimals,
        ...others,
        lastUpdate: new Date().getTime(),
      });
      storeStorage.currentBalanceRaw[key] = newInfo;
    }
  }

  getBalanceInfoCacheByKey(key) {
    const { balance, decimals, lastUpdate, ...others } =
      storeStorage.currentBalanceRaw[key] || {};
    return { balance, decimals, lastUpdate, ...others };
  }

  fetchBalancePendingQueue = {};

  async fetchBalanceInfo({ wallet, address, tokenKey }) {
    if (this.fetchBalancePendingQueue[address]) {
      return storeStorage.currentBalanceRaw[tokenKey];
    }
    this.fetchBalancePendingQueue[address] = true;
    const balanceInfo =
      // TODO cancel pending balance request if component destroy
      await this.balanceFetchSemaphore.runExclusive(async (semaphoreValue) => {
        if (!this.fetchBalancePendingQueue[address]) {
          return storeStorage.currentBalanceRaw[tokenKey];
        }
        const result = await wallet.chainProvider.getAccountInfo({ address });
        delete this.fetchBalancePendingQueue[address];
        return result;
      });
    // TODO update cache balance here, and View only read balance from cache, not from api
    // { balance, decimals, ...others };
    return balanceInfo;
  }
}

global._storeBalance = new StoreBalance();
export default global._storeBalance;
