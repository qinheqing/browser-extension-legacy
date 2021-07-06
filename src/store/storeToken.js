import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import OneTokenInfo from '../classes/OneTokenInfo';
import BaseStore from './BaseStore';
import storeAccount from './storeAccount';
import storeChain from './storeChain';

class StoreToken extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    this.autosave('currentTokensRaw');

    autorun(() => {
      const address = storeAccount.currentAccountAddress;
      untracked(() => {
        if (
          this.currentTokensRaw.ownerAddress &&
          this.currentTokensRaw.ownerAddress !== address
        ) {
          this.currentTokensRaw.tokens = [];
        }
      });
    });
  }

  // TODO custom token added by user (ETH)
  @observable
  currentTokensRaw = {
    ownerAddress: '',
    tokens: [],
  };

  @observable
  currentDetailToken = null;

  @computed
  get currentTokens() {
    return [
      this.currentNativeToken,
      ...this.currentTokensRaw.tokens.map(
        (options) =>
          new OneTokenInfo({
            ...options,
            chainKey: storeChain.currentChainKey,
          }),
      ),
    ];
  }

  @computed
  get currentNativeToken() {
    const { address, currency } = storeAccount.currentAccount;
    return new OneTokenInfo({
      chainKey: storeChain.currentChainKey,
      name: currency,
      symbol: currency,
      address,
      isNative: true,
    });
  }

  setCurrentTokens({ ownerAddress, tokens }) {
    if (ownerAddress === storeAccount.currentAccount.address) {
      // TODO update token balance to storeBalance
      this.currentTokensRaw = {
        ownerAddress,
        tokens,
      };
    }
  }
}

global._storeToken = new StoreToken();
export default global._storeToken;
