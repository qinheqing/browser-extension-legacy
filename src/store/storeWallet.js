import { observable, autorun, untracked, makeObservable, action } from 'mobx';
import WalletBase from '../wallets/WalletBase';
import BaseStore from './BaseStore';

class StoreWallet extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);
    this.initWallet();
  }

  @observable.ref
  currentWallet = new WalletBase();

  @action.bound
  setCurrentWallet(wallet) {
    this.currentWallet = wallet;
  }

  async initWallet() {
    const storeAccount = (await import('./storeAccount')).default;
    // only import this module is OK, autorun will handle update
    // storeAccount.updateCurrentWallet();
  }
}

global._storeWallet = new StoreWallet();
export default global._storeWallet;
