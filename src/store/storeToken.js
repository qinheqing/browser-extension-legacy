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
    return [
      this.currentNativeToken,
      ...storeStorage.currentTokensRaw.tokens.map((tokenRaw) => {
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
      }),
    ];
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
    const key = this._buildTokenMetaKey({ token });
    return cloneDeep(storeStorage.tokenMetasRaw[key]);
  }

  shouldReloadTokenMetas(tokens) {
    if (this.allTokenListMeta?.length) {
      return false;
    }
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

  @action.bound
  async updateTokensMeta({ tokens, forceUpdateTokenMeta = false }) {
    if (!this.shouldReloadTokenMetas(tokens) && !forceUpdateTokenMeta) {
      return;
    }
    await this.fetchAllTokenListMeta();
    const metas = {};
    tokens.forEach((token) => {
      const tokenMeta = this.allTokenListMeta.find(
        (item) => item.address === token.contractAddress,
      );
      const key = this._buildTokenMetaKey({ token });
      // give default empty object, so that shouldReloadTokenMetas() can work correctly.
      metas[key] = {
        ...tokenMeta,
        lastUpdate: new Date().getTime(),
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
