import { ObservableStore } from '@metamask/obs-store';
import { isFunction, isNil } from 'lodash';

/**
 * @typedef {Object} CachedBalancesOptions
 * @property {Object} accountTracker An {@code AccountTracker} reference
 * @property {Function} getNetwork A function to get the current network
 * @property {Function} getCurrentChainId A function to get the current chainId
 * @property {Object} initState The initial controller state
 */

/**
 * Background controller responsible for maintaining
 * a cache of account balances in local storage
 */
export default class CachedBalancesController {
  /**
   * Creates a new controller instance
   *
   * @param {CachedBalancesOptions} [opts] - Controller configuration parameters
   */
  constructor(opts = {}) {
    const { accountTracker, getNetwork, getCurrentChainId } = opts;

    this.accountTracker = accountTracker;
    this.getNetwork = getNetwork;
    this.getCurrentChainId = getCurrentChainId;

    const initState = { cachedBalances: {}, ...opts.initState };
    this.store = new ObservableStore(initState);

    this._registerUpdates();
  }

  async getBalanceCacheKey() {
    let key;
    if (isFunction(this.getCurrentChainId)) {
      key = this.getCurrentChainId();
    }
    if (isNil(key)) {
      key = await this.getNetwork();
    }
    return key;
  }

  /**
   * Updates the cachedBalances property for the current network. Cached balances will be updated to those in the passed accounts
   * if balances in the passed accounts are truthy.
   *
   * @param {Object} obj - The the recently updated accounts object for the current network
   * @returns {Promise<void>}
   */
  async updateCachedBalances({ accounts }) {
    const key = await this.getBalanceCacheKey();
    const balancesToCache = await this._generateBalancesToCache(accounts, key);
    this.store.updateState({
      cachedBalances: balancesToCache,
    });
  }

  _generateBalancesToCache(newAccounts, cacheKey) {
    const { cachedBalances } = this.store.getState();
    const currentChainBalancesToCache = { ...cachedBalances[cacheKey] };

    Object.keys(newAccounts).forEach((accountID) => {
      const account = newAccounts[accountID];

      if (account.balance) {
        currentChainBalancesToCache[accountID] = account.balance;
      }
    });
    const balancesToCache = {
      ...cachedBalances,
      [cacheKey]: currentChainBalancesToCache,
    };

    return balancesToCache;
  }

  /**
   * Removes cachedBalances
   */

  clearCachedBalances() {
    this.store.updateState({ cachedBalances: {} });
  }

  /**
   * Sets up listeners and subscriptions which should trigger an update of cached balances. These updates will
   * happen when the current account changes. Which happens on block updates, as well as on network and account
   * selections.
   *
   * @private
   *
   */
  _registerUpdates() {
    const update = this.updateCachedBalances.bind(this);
    this.accountTracker.store.subscribe(update);
  }
}
