import { observable, autorun, untracked, makeObservable } from 'mobx';
import WalletBase from '../wallets/WalletBase';
import walletFactory from '../wallets/walletFactory';
import BaseStore from './BaseStore';
import storeAccount from './storeAccount';
import storeChain from './storeChain';

class StoreWallet extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    autorun(() => {
      const { currentAccount } = storeAccount;
      const { currentChainInfo } = storeChain;
      untracked(() => {
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
}

global._storeWallet = new StoreWallet();
export default global._storeWallet;
