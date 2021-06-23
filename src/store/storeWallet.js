import { observable, autorun, untracked, makeObservable } from 'mobx';
import WalletBase from '../wallets/WalletBase';
import walletFactory from '../wallets/walletFactory';
import BaseStore from './BaseStore';
import storeAccount from './storeAccount';
import storeChain from './storeChain';
import storeToken from './storeToken';

class StoreWallet extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    // TODO do not use auto run to new Wallet, as currentAccount balance change will trigger this callback
    autorun(() => {
      const { currentAccount } = storeAccount;
      const { currentChainInfo } = storeChain;
      untracked(() => {
        console.log('Create wallet instance');
        // TODO debounce
        this.currentWallet = walletFactory.createWallet({
          chainInfo: currentChainInfo,
          accountInfo: currentAccount,
        });
      });
    });
  }

  @observable
  currentWallet = new WalletBase();

  async getCurrentAccountTokens() {
    const tokensRes = await this.currentWallet.chainProvider.getAccountTokens();
    console.log('getCurrentAccountTokens', tokensRes);
    storeToken.setCurrentTokens(tokensRes);
  }
}

global._storeWallet = new StoreWallet();
export default global._storeWallet;
