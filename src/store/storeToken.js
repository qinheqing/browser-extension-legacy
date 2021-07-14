import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { toLower, debounce, cloneDeep, merge } from 'lodash';
import OneTokenInfo from '../classes/OneTokenInfo';
import { ROUTE_TX_HISTORY } from '../routes/routeUrls';
import BaseStore from './BaseStore';
import storeAccount from './storeAccount';
import storeChain from './storeChain';
import storeWallet from './storeWallet';
import storeTx from './storeTx';
import storeHistory from './storeHistory';
import storeStorage from './storeStorage';

class StoreToken extends BaseStore {
  constructor(props) {
    super(props);
    this.filterTokenList = debounce(this.filterTokenList, 500);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    autorun(() => {
      // TODO same address but different chainKey
      const address = storeAccount.currentAccountAddress;
      untracked(() => {
        if (
          storeStorage.currentTokensRaw.ownerAddress &&
          storeStorage.currentTokensRaw.ownerAddress !== address
        ) {
          storeStorage.currentTokensRaw.tokens = [];
        }
      });
    });

    autorun(() => {
      const chainKey = storeChain.currentChainKey;
      untracked(() => {
        this.allTokenList = [];
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
        const { decimals, name, symbol, logoURI } = tokenMeta || {};

        const tokenInfo = new OneTokenInfo(
          merge({}, tokenRaw, {
            decimals,
            name,
            symbol,
            logoURI,
          }),
        );

        return tokenInfo;
      }),
    ];
  }

  @computed
  get currentNativeToken() {
    const { address, currency } = storeAccount.currentAccount;
    return new OneTokenInfo({
      chainKey: storeChain.currentChainKey,
      name: currency,
      symbol: currency,
      decimals: storeWallet.currentWallet.options.balanceDecimals,
      icon: storeChain.currentChainInfo?.currencyIcon,
      address,
      isNative: true,
    });
  }

  @action.bound
  setCurrentTokens({ ownerAddress, tokens }) {
    if (ownerAddress === storeAccount.currentAccount.address) {
      // TODO update token balance to storeBalance
      storeStorage.currentTokensRaw = {
        ownerAddress,
        tokens,
      };
      this.updateTokensMeta(tokens);
    }
  }

  async getCurrentAccountTokens() {
    if (!storeAccount.currentAccount) {
      return;
    }
    const tokensRes =
      await storeWallet.currentWallet.chainProvider.getAccountTokens();
    console.log('getCurrentAccountTokens', tokensRes);
    this.setCurrentTokens(tokensRes);
  }

  _buildTokenMetaKey({ token }) {
    return `${token.chainKey}-${token.contractAddress}`;
  }

  getTokenMeta({ token }) {
    const key = this._buildTokenMetaKey({ token });
    return cloneDeep(storeStorage.tokenMetasRaw[key]);
  }

  @action.bound
  async updateTokensMeta(tokens) {
    // TODO check tokens if meta should update
    if (!this.allTokenList || !this.allTokenList.length) {
      await this.fetchAllTokenList();
    }
    const metas = {};
    tokens.forEach((token) => {
      const tokenMeta = this.allTokenList.find(
        (item) => item.address === token.contractAddress,
      );
      if (tokenMeta) {
        const key = this._buildTokenMetaKey({ token });
        metas[key] = tokenMeta;
      }
    });
    storeStorage.tokenMetasRaw = {
      ...storeStorage.tokenMetasRaw,
      ...metas,
    };
  }

  @observable.ref
  allTokenList = [
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
  async fetchAllTokenList() {
    const tokenController = storeWallet.currentWallet?.tokenController;
    if (tokenController?.getTokenListAsync) {
      tokenController.getTokenListAsync().then((list) => {
        console.log(list);
        this.allTokenList = list;
      });
    }
  }

  filterTokenList({ text = '' }) {
    if (!text) {
      this.tokenListFiltered = null;
      return;
    }
    let tokens = this.allTokenList.filter((item) => {
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
}

global._storeToken = new StoreToken();
export default global._storeToken;
