import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import BaseStore from './BaseStore';
import storeBalance from './storeBalance';
import storeWallet from './storeWallet';

class StoreTransfer extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  @observable.ref
  fromToken = null;

  @observable
  toAddress = '6NuMY8tuAEbaysLbf2DX2Atuw24a5dpFvBJUu9Tundek';

  @observable
  amount = '0.01';

  @action.bound
  async doTransfer() {
    if (!this.fromToken || !this.toAddress || !this.amount) {
      return null;
    }
    // TODO fetch decimals by rpc fallback if cache is null
    const { decimals } = storeBalance.getBalanceInfoCacheByKey(
      this.fromToken.key,
    );
    const txid = await storeWallet.currentWallet.transfer({
      amount: this.amount,
      decimals,
      from: this.fromToken.address,
      to: this.toAddress,
      contract: this.fromToken.contractAddress,
      isToken: !this.fromToken.isNative,
    });
    return txid;
  }
}

global._storeTransfer = new StoreTransfer();
export default global._storeTransfer;
