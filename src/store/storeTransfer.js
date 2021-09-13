/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { trim } from 'lodash';
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

  @observable.ref
  toAddress = '';

  @observable.ref
  amount = '';

  @observable.ref
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

  @computed
  get fromDepositAddress() {
    return this.fromToken?.depositAddress || this.fromToken?.ownerAddress;
  }

  previewPayload = {};

  @action.bound
  async previewTransfer() {
    const wallet = storeWallet.currentWallet;

    const toAddress = trim(this.toAddress || '');
    const token = this.fromToken;

    // * all fields are empty
    if (!token || !toAddress || !this.amount) {
      return null;
    }

    // * address is valid;
    // * token address is valid;
    if (!wallet.isValidAddress({ address: toAddress })) {
      utilsToast.toast.error('收款地址不正确');
      return null;
    }

    // * amount is > 0
    // * amount is valid number
    if (
      !utilsNumber.isValidNumber(this.amount) ||
      utilsNumber.bigNum(this.amount).lte(0)
    ) {
      utilsToast.toast.error('转账金额不正确');
      return null;
    }

    // * amount is < ( balance - fee - createTokenFee )
    const maxAmount = this.getTransferMaxAmount(token);
    if (utilsNumber.bigNum(this.amount).gt(maxAmount)) {
      utilsToast.toast.error('转账余额不足');
      return null;
    }

    // * nativeToken (SOL) balance is insufficient
    if (
      (storeToken.currentNativeTokenBalance.balance <= 0 && this.fee > 0) ||
      storeToken.currentNativeTokenBalance.balanceNormalized < this.fee
    ) {
      utilsToast.toast.error('手续费余额不足');
      return null;
    }

    const decimals = storeToken.getTokenDecimals(token);

    this.previewPayload = {
      amount: this.amount,
      decimals,
      from: token.address,
      to: toAddress,
      contract: token.contractAddress,
      // TODO change isToken,isNative to isNativeToken
      isToken: !token.isNative,
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

  getTransferMaxAmount(token) {
    // eslint-disable-next-line
    token = token || this.fromToken;
    const balanceInfo = storeBalance.getTokenBalanceInfoInCache(token);
    let amount = '0';
    if (balanceInfo) {
      const { balance } = balanceInfo;
      const decimals = storeToken.getTokenDecimals(token);
      amount = utilsNumber.toNormalNumber({
        value: balance,
        decimals,
        roundMode: 'floor',
      });

      if (token.isNative) {
        const fee = utilsNumber.isValidNumber(this.fee) ? this.fee : '0';
        // TODO minus chain fee + createTokenFee
        amount = utilsNumber.bigNum(amount).minus(fee).toFixed();
      }

      if (utilsNumber.bigNum(amount).lt(0)) {
        amount = '0';
      }

      if (!utilsNumber.isValidNumber(amount)) {
        amount = '0';
      }
    }
    return amount;
  }

  @action.bound
  fillMaxAmount() {
    this.amount = this.getTransferMaxAmount();
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
      decimals: storeToken.getTokenDecimals(storeToken.currentNativeToken),
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
