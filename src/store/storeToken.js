/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { toLower, debounce, cloneDeep, merge, isNil } from 'lodash';
import OneTokenInfo from '../classes/OneTokenInfo';
import { ROUTE_TX_HISTORY } from '../routes/routeUrls';
import utilsNumber from '../utils/utilsNumber';
import BaseStore from './BaseStore';
import storeAccount from './storeAccount';
import storeChain from './storeChain';
import storeWallet from './storeWallet';
import storeTx from './storeTx';
import storeHistory from './storeHistory';
import storeStorage from './storeStorage';
import storePrice from './storePrice';
import storeBalance from './storeBalance';

class StoreToken extends BaseStore {
  constructor(props) {
    super(props);
    this.filterTokenList = debounce(this.filterTokenList, 500);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    autorun(() => {
      const address = storeAccount.currentAccountAddress;
      const chainKey = storeAccount.currentAccountChainKey;
      untracked(() => {
        if (
          storeStorage.currentTokensRaw?.chainKey !== chainKey ||
          storeStorage.currentTokensRaw?.ownerAddress !== address
        ) {
          storeStorage.currentTokensRaw.tokens = [];
        }
      });
    });

    autorun(() => {
      const chainKey = storeChain.currentChainKey;
      untracked(() => {
        this.allTokenListMeta = [];
        this.tokenListFiltered = null;
      });
    });
  }

  @observable
  currentDetailToken = null;

  @computed
  get currentTokens() {
    const { tokens } = storeStorage.currentTokensRaw;
    const tokenInfoList = tokens.map((tokenRaw) => {
      const tokenMeta = this.getTokenMeta({ token: tokenRaw });
      const { decimals, name, symbol, logoURI, extensions } = tokenMeta || {};

      const tokenInfo = new OneTokenInfo(
        merge({}, tokenRaw, {
          decimals,
          name,
          symbol,
          logoURI,
          extensions,
        }),
      );

      return tokenInfo;
    });
    const tokenSorted = tokenInfoList.slice().sort((a, b) => {
      const balance0 = storeBalance.getTokenBalanceInfoInCache(a).balance;
      const price0 = storePrice.getTokenPrice({ token: a });
      const decimals0 = this.getTokenDecimals(a);
      const fiat0 = utilsNumber.toNormalNumber({
        value: balance0 * price0,
        decimals: decimals0,
      });

      const balance1 = storeBalance.getTokenBalanceInfoInCache(b).balance;
      const price1 = storePrice.getTokenPrice({ token: b });
      const decimals1 = this.getTokenDecimals(b);
      const fiat1 = utilsNumber.toNormalNumber({
        value: balance1 * price1,
        decimals: decimals1,
      });

      return fiat0 > fiat1 ? -1 : 1;
    });
    return [this.currentNativeToken, ...tokenSorted];
  }

  newTokenInfo() {
    const tokenController = storeWallet.currentWallet?.tokenController;
    return tokenController.newTokenInfo();
  }

  buildNativeToken({ account, chainInfo }) {
    const { address } = account;
    const { tokenId, name, symbol } = chainInfo?.nativeToken || {};
    return new OneTokenInfo({
      chainKey: chainInfo.key,
      name,
      symbol: chainInfo.currency || symbol,
      decimals: storeWallet.currentWallet.options.balanceDecimals,
      icon: chainInfo?.currencyIcon,
      address,
      isNative: true,
      tokenId,
    });
  }

  @computed
  get currentNativeToken() {
    return this.buildNativeToken({
      account: storeAccount.currentAccount,
      chainInfo: storeChain.currentChainInfo,
    });
  }

  @action.bound
  async setCurrentTokens({
    chainKey,
    ownerAddress,
    tokens,
    forceUpdateTokenMeta = false,
  }) {
    if (
      chainKey === storeAccount.currentAccount.chainKey &&
      ownerAddress === storeAccount.currentAccount.address
    ) {
      // TODO update token balance to storeBalance
      storeStorage.currentTokensRaw = {
        chainKey,
        ownerAddress,
        tokens,
      };
      // TODO forceUpdateTokenMeta per day
      // - update token meta by tokenList.json
      await this.updateTokensMeta({ tokens, forceUpdateTokenMeta });
      // - update token price
      await storePrice.fetchAllPrices(this.currentTokens);
    }
  }

  async fetchCurrentAccountTokens({ forceUpdateTokenMeta = false } = {}) {
    if (!storeAccount.currentAccount) {
      return;
    }
    const tokensRes =
      await storeWallet.currentWallet.chainProvider.getAccountTokens();
    console.log('fetchCurrentAccountTokens', tokensRes);
    await this.setCurrentTokens({ ...tokensRes, forceUpdateTokenMeta });
  }

  _buildTokenMetaKey({ token }) {
    return `${token.chainKey} => ${token.contractAddress}`;
  }

  getTokenMeta({ token }) {
    const { chainKey, isNative } = token;
    const key = this._buildTokenMetaKey({ token });
    let tokenMeta = cloneDeep(storeStorage.tokenMetasRaw[key]);

    // * try to get nativeTokenMeta (which is NOT included by tokenList)
    if (!tokenMeta && isNative) {
      const chainInfo = storeChain.getChainInfoByKey(chainKey);
      tokenMeta = cloneDeep(chainInfo?.nativeToken);
    }
    return tokenMeta;
  }

  shouldReloadTokenMetas(tokens) {
    let result = false;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const key = this._buildTokenMetaKey({ token });
      // TODO check lastUpdate
      if (!storeStorage.tokenMetasRaw?.[key]) {
        result = true;
        break;
      }
    }
    return result;
  }

  correctTokenSymbol(tokenMeta = {}) {
    // eslint-disable-next-line prefer-const
    let { symbol, address } = tokenMeta;
    if (address === 'So11111111111111111111111111111111111111112') {
      symbol = 'wSOL';
    }
    return symbol;
  }

  @action.bound
  async updateTokensMeta({ tokens = [], forceUpdateTokenMeta = false }) {
    const shouldReload =
      this.shouldReloadTokenMetas(tokens) || forceUpdateTokenMeta;
    if (!shouldReload) {
      return;
    }
    if (!this.allTokenListMeta.length) {
      await this.fetchAllTokenListMeta();
    }
    const metas = {};
    tokens.forEach((token) => {
      const tokenMeta = this.allTokenListMeta.find(
        (item) => item.address === token.contractAddress,
      );
      const symbol = this.correctTokenSymbol(tokenMeta);
      const key = this._buildTokenMetaKey({ token });
      // give default empty object, so that shouldReloadTokenMetas() can work correctly.
      metas[key] = {
        ...tokenMeta,
        lastUpdate: new Date().getTime(),
        symbol,
      };
    });
    storeStorage.tokenMetasRaw = {
      ...storeStorage.tokenMetasRaw,
      ...metas,
    };
  }

  @observable.ref
  allTokenListMeta = [
    /*
    address: "2jQc2jDHVCewoWsQJK7JPLetP7UjqXvaFdno8rtrD8Kg"
    chainId: 102
    decimals: 6
    name: "sHOG"
    symbol: "sHOG"
    logoURI
    extensions: [ coingeckoId: "usd-coin", website: "https://www.centre.io/"]
    tags: [ "stablecoin" ]
     */
  ];

  @observable.ref
  tokenListFiltered = null;

  @action.bound
  async fetchAllTokenListMeta() {
    const tokenController = storeWallet.currentWallet?.tokenController;
    if (tokenController?.getTokenListMetaAsync) {
      const list = await tokenController.getTokenListMetaAsync();
      this.allTokenListMeta = list;
    }
  }

  filterTokenList({ text = '' }) {
    if (!text) {
      this.tokenListFiltered = null;
      return;
    }
    let tokens = this.allTokenListMeta.filter((item) => {
      // TODO do not show SOL ATA token
      return (
        toLower(item.name).includes(toLower(text)) ||
        toLower(item.symbol).includes(toLower(text)) ||
        toLower(item.address).includes(toLower(text))
      );
    });
    if (!tokens.length) {
      if (storeWallet.currentWallet.isValidAddress({ address: text })) {
        tokens = [
          {
            address: text,
            symbol: '',
            name: '',
          },
        ];
      }
    }
    this.tokenListFiltered = tokens;
  }

  async addAssociateToken({ contract }) {
    // TODO check token contract.address is valid mint address
    const txid = await storeWallet.currentWallet.addAssociateToken({
      contract,
    });
    if (txid) {
      storeTx.addPendingTx(txid);
      storeHistory.push(ROUTE_TX_HISTORY);
      return txid;
    }
    return '';
  }

  getTokenDecimals(token) {
    let { decimals } = token;

    // * get decimals from tokenMeta (tokenList)
    if (isNil(decimals)) {
      const tokenMeta = this.getTokenMeta({ token });
      decimals = tokenMeta?.decimals;
    }

    // * get decimals from tokenBalanceInfo
    if (isNil(decimals)) {
      // TODO fetch decimals by rpc fallback if cache is null
      const balanceInfo = storeBalance.getTokenBalanceInfoInCache(token);
      decimals = balanceInfo.decimals;
    }
    return decimals;
  }
}

global._storeToken = new StoreToken();
export default global._storeToken;
