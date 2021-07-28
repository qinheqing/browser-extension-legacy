import { ObservableStore } from '@metamask/obs-store';
import log from 'loglevel';
import { normalize as normalizeAddress } from 'eth-sig-util';
import ethUtil from 'ethereumjs-util';
import getFetchWithTimeout from '../../../shared/modules/fetch-with-timeout';

const fetchWithTimeout = getFetchWithTimeout(30000);

// By default, poll every 3 minutes
const DEFAULT_INTERVAL = 180 * 1000;

const coingeckoAssetPlatforms = {
  1: 'ethereum',
  56: 'binance-smart-chain',
  100: 'xdai',
  250: 'fantom',
  128: 'huobi-token',
  137: 'polygon-pos',
  66: 'okex-chain',
};

/**
 * A controller that polls for token exchange
 * rates based on a user's current token list
 */
export default class TokenRatesController {
  /**
   * Creates a TokenRatesController
   *
   * @param {Object} [config] - Options to configure controller
   */
  constructor({ preferences, getNativeCurrency, getCurrentChainId } = {}) {
    this.store = new ObservableStore();
    this.getNativeCurrency = getNativeCurrency;
    this.getCurrentChainId = getCurrentChainId;
    this.tokens = preferences.getState().tokens;
    preferences.subscribe(({ tokens = [] }) => {
      this.tokens = tokens;
    });
  }

  /**
   * Updates exchange rates for all tokens
   */
  async updateExchangeRates() {
    const contractExchangeRates = {};
    const nativeCurrency = this.getNativeCurrency().toLowerCase();
    const currentChainId = Number(this.getCurrentChainId());
    const assetPlatform =
      coingeckoAssetPlatforms[String(currentChainId)] || 'ethereum';
    const pairs = this._tokens.map((token) => token.address).join(',');
    const query = `contract_addresses=${pairs}&vs_currencies=${nativeCurrency}`;
    if (this._tokens.length > 0) {
      try {
        const response = await fetchWithTimeout(
          `https://api.coingecko.com/api/v3/simple/token_price/${assetPlatform}?${query}`,
        );
        const prices = await response.json();
        this._tokens.forEach((token) => {
          const price =
            prices[token.address.toLowerCase()] ||
            prices[ethUtil.toChecksumAddress(token.address)];
          contractExchangeRates[normalizeAddress(token.address)] = price
            ? price[nativeCurrency]
            : 0;
        });
      } catch (error) {
        log.warn(
          `MetaMask - TokenRatesController exchange rate fetch failed.`,
          error,
        );
      }
    }
    this.store.putState({ contractExchangeRates });
  }

  /* eslint-disable accessor-pairs */
  /**
   * @type {Array}
   */
  set tokens(tokens) {
    this._tokens = tokens;
    this.updateExchangeRates();
  }
  /* eslint-enable accessor-pairs */

  start(interval = DEFAULT_INTERVAL) {
    this._handle && clearInterval(this._handle);
    if (!interval) {
      return;
    }
    this._handle = setInterval(() => {
      this.updateExchangeRates();
    }, interval);
    this.updateExchangeRates();
  }

  stop() {
    this._handle && clearInterval(this._handle);
  }
}
