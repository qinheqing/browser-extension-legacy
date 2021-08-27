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
import utilsApp from '../utils/utilsApp';
import utilsNumber from '../utils/utilsNumber';
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
  updateTokenBalance(tokenInfo, { balance, decimals, ...others } = {}) {
    const { key, symbol, name } = tokenInfo;
    if (key) {
      // use merge() DO NOT handle undefined value
      const newInfo = merge({}, storeStorage.tokenBalancesRaw[key], {
        balance,
        decimals,
        ...others,
        lastUpdate: new Date().getTime(),
        tokenInfo: {
          symbol,
          name,
        },
      });
      newInfo.balanceNormalized = utilsNumber.toNormalNumber({
        value: newInfo.balance,
        decimals: newInfo.decimals,
      });

      storeStorage.tokenBalancesRaw = {
        ...storeStorage.tokenBalancesRaw,
        [key]: newInfo,
      };
    }
  }

  getTokenBalanceInfoInCache(tokenInfo) {
    const { key } = tokenInfo;
    const { balance, decimals, lastUpdate, ...others } =
      storeStorage.tokenBalancesRaw[key] || {};
    return { balance, decimals, lastUpdate, ...others };
  }

  fetchBalancePendingQueue = {};

  deletePendingBalanceFetchTask(address) {
    delete this.fetchBalancePendingQueue[address];
  }

  async fetchBalanceInfo({ wallet, address, tokenInfo }) {
    // address is tokenAddress for rpc fetch
    const tokenKey = tokenInfo.key;
    if (this.fetchBalancePendingQueue[address]) {
      return storeStorage.tokenBalancesRaw[tokenKey];
    }
    this.fetchBalancePendingQueue[address] = true;
    const balanceInfo =
      // TODO cancel pending balance request if component destroy
      await this.balanceFetchSemaphore.runExclusive(async (semaphoreValue) => {
        if (!this.fetchBalancePendingQueue[address]) {
          return storeStorage.tokenBalancesRaw[tokenKey];
        }
        const result = await wallet.chainManager.getAccountInfo({ address });
        await utilsApp.delay(150);
        this.deletePendingBalanceFetchTask(address);
        return result;
      });
    // TODO update cache balance here, and View only read balance from cache, not from api
    // { balance, decimals, ...others };
    return balanceInfo;
  }
}

global._storeBalance = new StoreBalance();
export default global._storeBalance;
