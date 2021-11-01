import Web3 from 'web3';
import { warn } from 'loglevel';
import { cloneDeep } from 'lodash';
import SINGLE_CALL_BALANCES_ABI from 'single-call-balance-checker-abi';
import {
  MAINNET_CHAIN_ID,
  BSC_CHAIN_ID,
  HECO_CHAIN_ID,
  KOVAN_CHAIN_ID,
  MATIC_CHAIN_ID,
  XDAI_CHAIN_ID,
  OKEX_CHAIN_ID,
  AVAX_CHAIN_ID,
} from '../../../shared/constants/network';
import {
  SINGLE_CALL_BALANCES_ADDRESS,
  SINGLE_CALL_BALANCES_ADDRESS_BSC,
  SINGLE_CALL_BALANCES_ADDRESS_HECO,
  SINGLE_CALL_BALANCES_ADDRESS_KOVAN,
  SINGLE_CALL_BALANCES_ADDRESS_MATIC,
  SINGLE_CALL_BALANCES_ADDRESS_XDAI,
  SINGLE_CALL_BALANCES_ADDRESS_OKEX,
  SINGLE_CALL_BALANCES_ADDRESS_AVAX,
} from '../constants/contracts';
import { contractMap } from '../../../shared/tokens';
import { stringifyBalance } from '../lib/util';
import { NETWORK_EVENTS } from './network';

// By default, poll every 3 minutes
const DEFAULT_INTERVAL = 180 * 1000;

const supportedChainIds = [
  MAINNET_CHAIN_ID,
  BSC_CHAIN_ID,
  HECO_CHAIN_ID,
  KOVAN_CHAIN_ID,
  MATIC_CHAIN_ID,
  XDAI_CHAIN_ID,
  OKEX_CHAIN_ID,
  AVAX_CHAIN_ID,
];

const contractAddresses = {
  [AVAX_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS_AVAX,
  [MAINNET_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS,
  [BSC_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS_BSC,
  [HECO_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS_HECO,
  [KOVAN_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS_KOVAN,
  [MATIC_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS_MATIC,
  [XDAI_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS_XDAI,
  [OKEX_CHAIN_ID]: SINGLE_CALL_BALANCES_ADDRESS_OKEX,
};

/**
 * A controller that polls for token exchange
 * rates based on a user's current token list
 */
export default class DetectTokensController {
  /**
   * Creates a DetectTokensController
   *
   * @param {Object} [config] - Options to configure controller
   */
  constructor({
    interval = DEFAULT_INTERVAL,
    preferences,
    network,
    keyringMemStore,
  } = {}) {
    this.preferences = preferences;
    this.interval = interval;
    this.network = network;
    this.keyringMemStore = keyringMemStore;
  }

  /**
   * For each token in contract-metadata, find check selectedAddress balance.
   */
  async detectNewTokens() {
    if (!this.isActive) {
      return;
    }

    const { chainId, type } = this._network.store.getState().provider;

    if (!supportedChainIds.includes(chainId)) {
      return;
    }

    const contracts = contractMap[type];
    if (!contracts) {
      return;
    }

    const tokensToDetect = [];
    this.web3.setProvider(this._network._provider);
    for (const contractAddress in contracts) {
      if (
        // contracts[contractAddress].erc20 &&
        contracts[contractAddress] &&
        !this.tokenAddresses.includes(contractAddress.toLowerCase()) &&
        !this.hiddenTokens.includes(contractAddress.toLowerCase())
      ) {
        tokensToDetect.push(contractAddress);
      }
    }

    let result;
    const abiAddress =
      contractAddresses[chainId] || SINGLE_CALL_BALANCES_ADDRESS;

    try {
      result = await this._getTokenBalances(tokensToDetect, abiAddress);
    } catch (error) {
      warn(
        'MetaMask - DetectTokensController single call balance fetch failed',
        error,
      );
      return;
    }

    const { chainId: chainId0, type: type0 } =
      this._network.store.getState().provider;
    if (chainId !== chainId0 || type !== type0) {
      return;
    }

    tokensToDetect.forEach((tokenAddress, index) => {
      const balance = result && result[index];
      if (balance && balance.isZero && !balance.isZero()) {
        this._preferences.addToken(
          tokenAddress,
          contracts[tokenAddress].symbol,
          contracts[tokenAddress].decimals,
        );
      }
    });
  }

  /**
   * For each token in contract-metadata, find check selectedAddress balance.
   */
  async detectTokensBalance() {
    if (!this.isActive) {
      return;
    }
    const { chainId, type } = this._network.store.getState().provider;

    if (!supportedChainIds.includes(chainId)) {
      return;
    }

    const contracts = contractMap[type];
    if (!contracts) {
      return;
    }

    this.web3.setProvider(this._network._provider);

    let result;
    const abiAddress =
      contractAddresses[chainId] || SINGLE_CALL_BALANCES_ADDRESS;

    const userTokens = this._preferences.store.getState().tokens;
    const currentTokens = cloneDeep(userTokens);

    let balancesResult;
    try {
      balancesResult = await this._getTokenBalances(
        currentTokens.map((e) => e.address),
        abiAddress,
      );
    } catch (error) {
      warn(
        'MetaMask - DetectTokensController single call balance fetch failed',
        error,
      );
      return;
    }

    const { chainId: chainId0, type: type0 } =
      this._network.store.getState().provider;
    if (chainId !== chainId0 || type !== type0) {
      return;
    }

    if (
      Array.isArray(balancesResult) &&
      balancesResult.length === currentTokens.length
    ) {
      const tokensWithBalance = currentTokens.map((tokenAddress, index) => {
        const token = cloneDeep(currentTokens[index]);
        const balance = balancesResult[index];
        if (balance && !balance.isZero()) {
          token.string = stringifyBalance(
            balance,
            currentTokens[index].decimals,
          );
          token.balance = balance.toString();
        } else {
          token.string = '0';
          token.balance = '0';
        }
        return token;
      });
      this._preferences.updateTokensWithBalance(tokensWithBalance);
    }
  }

  async _getTokenBalances(tokens, abiAddress = SINGLE_CALL_BALANCES_ADDRESS) {
    const ethContract = this.web3.eth
      .contract(SINGLE_CALL_BALANCES_ABI)
      .at(abiAddress);
    return new Promise((resolve, reject) => {
      ethContract.balances([this.selectedAddress], tokens, (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
    });
  }

  /**
   * Restart token detection polling period and call detectNewTokens
   * in case of address change or user session initialization.
   *
   */
  restartTokenDetection() {
    if (!(this.isActive && this.selectedAddress)) {
      return;
    }
    this.detectNewTokens();
    this.detectTokensBalance();
    this.interval = DEFAULT_INTERVAL;
  }

  /* eslint-disable accessor-pairs */
  /**
   * @type {Number}
   */
  set interval(interval) {
    this._handle && clearInterval(this._handle);
    this._timer && clearInterval(this._timer);
    if (!interval) {
      return;
    }

    this._handle = setInterval(() => {
      this.detectNewTokens();
    }, interval);

    this._timer = setInterval(() => {
      this.detectTokensBalance();
    }, 8 * 1000);
  }

  /**
   * In setter when selectedAddress is changed, detectNewTokens and restart polling
   * @type {Object}
   */
  set preferences(preferences) {
    if (!preferences) {
      return;
    }
    this._preferences = preferences;
    const currentTokens = preferences.store.getState().tokens;
    this.tokenAddresses = currentTokens
      ? currentTokens.map((token) => token.address)
      : [];
    this.hiddenTokens = preferences.store.getState().hiddenTokens;
    preferences.store.subscribe(({ tokens = [], hiddenTokens = [] }) => {
      this.tokenAddresses = tokens.map((token) => token.address);
      this.hiddenTokens = hiddenTokens;
    });

    preferences.store.subscribe(({ selectedAddress }) => {
      if (this.selectedAddress !== selectedAddress) {
        this.selectedAddress = selectedAddress;
        this.restartTokenDetection();
      }
    });
  }

  /**
   * @type {Object}
   */
  set network(network) {
    if (!network) {
      return;
    }
    this._network = network;
    this.web3 = new Web3(network._provider);
    network.on(NETWORK_EVENTS.NETWORK_DID_CHANGE, () => {
      this.detectNewTokens();
      this.detectTokensBalance();
    });
  }

  /**
   * In setter when isUnlocked is updated to true, detectNewTokens and restart polling
   * @type {Object}
   */
  set keyringMemStore(keyringMemStore) {
    if (!keyringMemStore) {
      return;
    }
    this._keyringMemStore = keyringMemStore;
    this._keyringMemStore.subscribe(({ isUnlocked }) => {
      if (this.isUnlocked !== isUnlocked) {
        this.isUnlocked = isUnlocked;
        if (isUnlocked) {
          this.restartTokenDetection();
        }
      }
    });
  }

  /**
   * Internal isActive state
   * @type {Object}
   */
  get isActive() {
    return this.isOpen && this.isUnlocked;
  }
  /* eslint-enable accessor-pairs */
}
