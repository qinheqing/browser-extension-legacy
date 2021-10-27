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
import utilsToast from '../utils/utilsToast';
import BaseStore from './BaseStore';
import storeAccount from './storeAccount';
import storeChain from './storeChain';
import storeWallet from './storeWallet';
import storeTx from './storeTx';
import storeHistory from './storeHistory';
import storeStorage from './storeStorage';
import storePrice from './storePrice';
import storeBalance from './storeBalance';
import createAutoRun from './createAutoRun';

class StoreToken extends BaseStore {
  constructor(props) {
    super(props);
    this.filterTokenList = debounce(this.filterTokenList, 500);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    createAutoRun(
      () => {
        const address = storeAccount.currentAccountAddress;
        const chainKey = storeAccount.currentAccountChainKey;
        if (
          storeStorage.currentTokensRaw?.chainKey !== chainKey ||
          storeStorage.currentTokensRaw?.ownerAddress !== address
        ) {
          storeStorage.currentTokensRaw.tokens = [];
        }
      },
      () => {
        const address = storeAccount.currentAccountAddress;
        const chainKey = storeAccount.currentAccountChainKey;
      },
    )();

    createAutoRun(
      () => {
        this.allTokenListMeta = [];
        this.tokenListFiltered = null;
      },
      () => {
        const chainKey = storeChain.currentChainKey;
      },
    )();
  }

  @observable.ref
  currentDetailToken = null;

  @computed
  get currentTokens() {
    const { tokens } = storeStorage.currentTokensRaw;
    const ownerAddress = storeAccount.currentAccountAddress;
    const tokenInfoList = tokens
      .map((tokenRaw) => {
        const tokenMeta = this.getTokenMeta({ token: tokenRaw });
        const { decimals, name, symbol, logoURI, extensions, tokenId } =
          tokenMeta || {};

        const tokenInfo = new OneTokenInfo(
          merge({}, tokenRaw, {
            decimals,
            name,
            symbol,
            logoURI,
            extensions,
            tokenId,
            ownerAddress,
          }),
        );

        if (isNil(tokenInfo.decimals)) {
          console.error(
            `token decimals not found: ${JSON.stringify(tokenRaw)}`,
          );
          return null;
        }

        return tokenInfo;
      })
      .filter(Boolean);
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

      if (fiat0 === fiat1) {
        return balance0 > balance1 ? -1 : 1;
      }

      return fiat0 > fiat1 ? -1 : 1;
    });
    return [this.currentNativeToken, ...tokenSorted];
  }

  newTokenInfo() {
    const tokenManager = storeWallet.currentWallet?.tokenManager;
    return tokenManager.newTokenInfo();
  }

  buildNativeToken({ account, chainInfo }) {
    const { address } = account;
    const { tokenId, name, symbol, logoURI, decimals, precision } =
      chainInfo?.nativeToken || {};
    return new OneTokenInfo({
      chainKey: chainInfo.key,
      name,
      symbol: symbol || chainInfo.currency,
      decimals,
      logoURI: logoURI || chainInfo?.currencyLogo,
      address,
      isNative: true,
      tokenId,
    });
  }

  @computed
  get currentNativeToken() {
    return this.buildNativeToken({
      account: storeAccount.currentAccountInfo,
      chainInfo: storeChain.currentChainInfo,
    });
  }

  @computed
  get currentNativeTokenBalance() {
    return storeBalance.getTokenBalanceInfoInCache(this.currentNativeToken);
  }

  @action.bound
  async setCurrentTokens({
    chainKey,
    ownerAddress,
    tokens,
    forceUpdateTokenMeta = false,
  }) {
    if (
      chainKey === storeAccount.currentAccountInfo.chainKey &&
      ownerAddress === storeAccount.currentAccountInfo.address
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
    if (!storeAccount.currentAccountInfo) {
      return;
    }
    const ownerAddress = storeAccount.currentAccountInfo.address;
    const ownerAccountKey = storeAccount.currentAccountInfo.key;
    const tokensRes =
      await storeWallet.currentWallet.chainManager.getAccountTokens({
        address: ownerAddress,
      });
    console.log('fetchCurrentAccountTokens', tokensRes);
    tokensRes.tokens = tokensRes.tokens || [];
    const localTokens = Object.values(
      storeStorage.accountLocalTokensRaw[ownerAccountKey] || {},
    );
    tokensRes.tokens = tokensRes.tokens.concat(localTokens);
    await this.setCurrentTokens({ ...tokensRes, forceUpdateTokenMeta });
  }

  /**
   *
   * @param account
   * @param token
   * address: "cfxtest:ace00yhwcv70r6jbf2e1nw6tkrk491w9v27pb95w9n"
     chainId: 1
     contract: "cfxtest:ace00yhwcv70r6jbf2e1nw6tkrk491w9v27pb95w9n"
     decimals: 18
     logoURI: "https://image.cd.mmzhuli.com/54fba1c21ee90f0c8c7670eecf987346?hjw=200&hjh=200"
     name: "cUSDT"
     symbol: "cUSDT"
   */
  addAccountLocalToken({ account, token }) {
    // eslint-disable-next-line no-param-reassign
    account = account || storeAccount.currentAccountInfo;
    const { chainKey, key: accountKey } = account;
    const { address, symbol, name, decimals } = token;
    const data = storeStorage.accountLocalTokensRaw[accountKey] || {};
    const tokenInfo = {
      chainKey,
      address,
      contractAddress: address,
      _memo: {
        symbol,
        name,
        decimals,
      },
    };
    data[address] = tokenInfo;

    this.updateSingleTokenMeta({
      tokenMeta: token,
      token: tokenInfo,
    });

    storeStorage.accountLocalTokensRaw = {
      ...storeStorage.accountLocalTokensRaw,
      [accountKey]: data,
    };
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

  _buildTokenMetaCache({ tokenMeta, token }) {
    const symbol = this.correctTokenSymbol(tokenMeta);
    const key = this._buildTokenMetaKey({ token });

    /*
    tokenMeta (from tokenList.json)
      address: "rz251Qbsa27sL8Y1H7h4qu71j6Q7ukNmskg5ZDhPCg3"
      chainId: 102
      decimals: 6
      logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rz251Qbsa27sL8Y1H7h4qu71j6Q7ukNmskg5ZDhPCg3/logo.png"
      name: "Hiro LaunchDAO"
      symbol: "HIRO"

    token (from RPC)
      address: "E7Q9obd837chGQY3mWz2YawNhkCQbAx4ZYisrSrrDPqD"
      associatedAddress: "E7Q9obd837chGQY3mWz2YawNhkCQbAx4ZYisrSrrDPqD"
      balance: "0"
      chainKey: "SOL_T"
      contractAddress: "rz251Qbsa27sL8Y1H7h4qu71j6Q7ukNmskg5ZDhPCg3"
      decimals: 9
      depositAddress: "AFDCmixQdG9XNejn6zyM8dueqWxqn9wmsMmf5i4RctxK"
      isAssociatedToken: true
      ownerAddress: "AFDCmixQdG9XNejn6zyM8dueqWxqn9wmsMmf5i4RctxK"
      chainId: 102
      platformId: "solana"
      programAddress: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
     */
    const meta = {
      address: token.contractAddress,
      chainId: token.chainId,
      decimals: token.decimals,
      name: symbol,
      ...tokenMeta,
      lastUpdate: new Date().getTime(),
      symbol,
      isEditable: !tokenMeta, // tokenMeta will be undefined, if not includes by tokenList.json
    };
    return {
      key,
      meta,
    };
  }

  @action.bound
  updateSingleTokenMeta({ tokenMeta, token }) {
    const { key, meta } = this._buildTokenMetaCache({
      token,
      tokenMeta,
    });
    const metas = {};
    metas[key] = {
      ...storeStorage.tokenMetasRaw[key],
      ...meta,
    };

    storeStorage.tokenMetasRaw = {
      ...storeStorage.tokenMetasRaw,
      ...metas,
    };
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
        (item) => item.address === (token.contractAddress || token.address),
      );
      const { meta, key } = this._buildTokenMetaCache({
        token,
        tokenMeta,
      });
      // give default empty object, so that shouldReloadTokenMetas() can work correctly.
      metas[key] = meta;
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

  @observable.ref
  recommended = null;

  @observable.ref
  tokenListFilteredText = '';

  @action.bound
  async fetchAllTokenListMeta() {
    const tokenManager = storeWallet.currentWallet?.tokenManager;
    if (tokenManager?.getTokenListMetaAsync) {
      const list = await tokenManager.getTokenListMetaAsync();
      if (Array.isArray(list) && tokenManager?.getRecommendTokenAddresses) {
        this.recommended = null;
        const addresses = tokenManager.getRecommendTokenAddresses();
        const recommended = list.filter((item) => addresses[item.address]);
        if (Array.isArray(recommended) && recommended.length > 0) {
          this.recommended = recommended;
        }
      }
      this.allTokenListMeta = list;
    }
  }

  getTokenSortWeight({ token, text }) {
    const searchText = toLower(text);
    const name = toLower(token.name);
    const symbol = toLower(token.symbol);
    const address = toLower(token.address);
    if (address === searchText) {
      return 1000;
    }

    if (symbol === searchText) {
      return 100;
    }

    if (name === searchText) {
      return 90;
    }

    if (symbol.includes(searchText)) {
      return 80;
    }

    if (name.includes(searchText)) {
      return 50;
    }

    if (address.includes(searchText)) {
      return 10;
    }
    return 0;
  }

  filterTokenList({ text = '', callback }) {
    this.tokenListFilteredText = text;
    if (!text) {
      this.tokenListFiltered = null;
      return;
    }
    let tokens = this.allTokenListMeta.filter((item) => {
      // TODO sort priority, name, symbol, address
      return (
        toLower(item.name).includes(toLower(text)) ||
        toLower(item.symbol).includes(toLower(text)) ||
        toLower(item.address).includes(toLower(text))
      );
    });
    if (!tokens.length) {
      if (storeWallet.currentWallet.isValidAddress(text)) {
        tokens = [
          {
            address: text,
            symbol: undefined,
            name: undefined,
          },
        ];
      }
    }

    tokens = tokens.sort((a, b) => {
      const w1 = this.getTokenSortWeight({
        token: a,
        text,
      });
      const w2 = this.getTokenSortWeight({
        token: b,
        text,
      });
      return w2 - w1;
    });
    this.tokenListFiltered = tokens;
    callback && callback();
  }

  async addAssociateToken(tokenMeta, fee) {
    const wallet = storeWallet.currentWallet;

    // CFX local token add mode
    if (wallet.isLocalAddTokenMode) {
      if (!tokenMeta.name || !tokenMeta.symbol) {
        utilsToast.toast.error('无法获取代币数据');
        return '';
      }
      this.addAccountLocalToken({ token: tokenMeta });
      storeHistory.goBack();
      return '';
    }

    // SOL chain token add mode
    if (fee && fee > this.currentNativeTokenBalance.balance) {
      utilsToast.toast.error('手续费不足');
      return '';
    }

    // TODO check token contract.address is valid mint address
    const txid = await wallet.addAssociateToken({
      contract: tokenMeta.address,
    });
    if (txid) {
      storeTx.addPendingTx(txid);
      storeHistory.push(ROUTE_TX_HISTORY);
      return txid;
    }
    return '';
  }

  getTokenDecimals(token) {
    if (!token) {
      return NaN;
    }
    let { decimals } = token;

    // * get decimals from tokenMeta (tokenList)
    if (isNil(decimals)) {
      const tokenMeta = this.getTokenMeta({ token });
      decimals = tokenMeta?.decimals;
    }

    // * get decimals from tokenBalanceInfo
    if (isNil(decimals)) {
      const balanceInfo = storeBalance.getTokenBalanceInfoInCache(token);
      decimals = balanceInfo.decimals;
    }

    // TODO fetch decimals by rpc fallback if cache is null
    if (isNil(decimals)) {
      decimals = 18;
      console.error(
        `Can not get token decimals: ${token.name ?? ''} ${
          token?.symbol ?? ''
        }`,
      );
    }
    return decimals;
  }
}

global._storeToken = new StoreToken();
export default global._storeToken;
