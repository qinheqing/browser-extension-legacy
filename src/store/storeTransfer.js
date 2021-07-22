/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import utilsNumber from '../utils/utilsNumber';
import utilsToast from '../utils/utilsToast';
import { ROUTE_TX_HISTORY } from '../routes/routeUrls';
import BaseStore from './BaseStore';
import storeBalance from './storeBalance';
import storeWallet from './storeWallet';
import storeHistory from './storeHistory';
import storeToken from './storeToken';
import storeTx from './storeTx';

class StoreTransfer extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  @observable.ref
  fromToken = null;

  @observable
  toAddress = '';

  @observable
  amount = '';

  @observable
  fee = '';

  @computed
  get symbolDisplay() {
    return this.fromToken?.symbolDisplay;
  }

  @computed
  get feeSymbol() {
    return storeToken.currentNativeToken.symbol;
  }

  @computed
  get fromAddress() {
    return this.fromToken?.address;
  }

  previewPayload = {};

  @action.bound
  async previewTransfer() {
    if (!this.fromToken || !this.toAddress || !this.amount) {
      return null;
    }
    const wallet = storeWallet.currentWallet;
    // * address is valid;
    // * token address is valid;
    if (!wallet.isValidAddress({ address: this.toAddress })) {
      utilsToast.toast.error('收款地址不正确');
      return null;
    }
    if (this.amount <= 0 || !utilsNumber.isValidNumber(this.amount)) {
      utilsToast.toast.error('转账金额不正确');
      return null;
    }
    // * amount is > 0
    // * amount is valid number
    // * amount is < ( balance - fee - createTokenFee )
    // TODO fetch decimals by rpc fallback if cache is null
    const { decimals } = storeBalance.getTokenBalanceInfoCacheByKey(
      this.fromToken.key,
    );
    this.previewPayload = {
      amount: this.amount,
      decimals,
      from: this.fromToken.address,
      to: this.toAddress,
      contract: this.fromToken.contractAddress,
      isToken: !this.fromToken.isNative,
    };
    return true;
  }

  @action.bound
  async doTransfer() {
    const wallet = storeWallet.currentWallet;
    // TODO add global loading toast
    // * get token address from native address
    // * create ATA token for receipt if token not associated (activated)
    // * test if mint address is same
    const txid = await wallet.transfer(this.previewPayload);
    if (txid) {
      utilsToast.toastTx({ txid, message: '转账提交成功' });
      this.clearData();
      storeTx.addPendingTx(txid);
      storeHistory.push(ROUTE_TX_HISTORY);
      return txid;
    }
    return '';
  }

  @action.bound
  fillMaxAmount() {
    const balanceInfo = storeBalance.getTokenBalanceInfoCacheByKey(
      this.fromToken.key,
    );
    if (balanceInfo) {
      const { balance, decimals } = balanceInfo;
      let amount = utilsNumber.toNormalNumber({
        value: balance,
        decimals,
        roundMode: 'floor',
      });
      if (this.fromToken.isNative) {
        amount = utilsNumber.bigNum(amount).minus(this.fee).toFixed();
      }

      if (amount < 0) {
        amount = '0';
      }
      if (!utilsNumber.isValidNumber(amount)) {
        amount = '';
      }
      this.amount = amount;
    }
  }

  @action.bound
  updateTransferFee(fee) {
    this.fee = fee;
  }

  @action.bound
  async fetchTransactionFee() {
    if (!storeWallet.currentWallet) {
      return;
    }
    let fee = await storeWallet.currentWallet.getTransactionFee();
    fee = utilsNumber.toNormalNumber({
      value: fee,
      decimals: storeToken.currentNativeToken.decimals,
    });
    this.updateTransferFee(fee);
  }

  @action.bound
  clearData() {
    this.amount = '';
    this.toAddress = '';
    this.fee = '';
  }
}

global._storeTransfer = new StoreTransfer();
export default global._storeTransfer;
