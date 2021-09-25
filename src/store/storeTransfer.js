/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { trim, debounce } from 'lodash';
import utilsNumber from '../utils/utilsNumber';
import utilsToast from '../utils/utilsToast';
import { ROUTE_TX_HISTORY } from '../routes/routeUrls';
import BaseStore from './BaseStore';
import storeBalance from './storeBalance';
import storeWallet from './storeWallet';
import storeHistory from './storeHistory';
import storeToken from './storeToken';
import storeTx from './storeTx';
import storeAccount from './storeAccount';

class StoreTransfer extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  autoRunFetchFeeInfo() {
    const dispose = autorun(() => {
      const payload = this.previewPayload;
      untracked(() => {
        this.fetchFeeInfoDebounce();
      });
    });
    return () => {
      dispose();
      console.log('dispose autorun autoRunFetchFeeInfo');
    };
  }

  @observable.ref
  fromToken = null;

  @observable.ref
  toAddress = '';

  @observable.ref
  amount = '';

  @computed
  get fee() {
    let _fee = this.feeInfo.fee;
    _fee = utilsNumber.toNormalNumber({
      value: _fee,
      decimals: storeToken.getTokenDecimals(storeToken.currentNativeToken),
    });
    return _fee;
  }

  @observable.ref
  feeInfo = {};

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

  @computed
  get previewPayload() {
    const toAddress = trim(this.toAddress || '');
    const token = this.fromToken;
    const decimals = storeToken.getTokenDecimals(token);

    return {
      decimals,
      amount: this.amount,
      to: toAddress,
      contract: token.contractAddress,
      from: token.address,
      // TODO change isToken,isNative to isNativeToken
      isToken: !token.isNative,
      tokenInfo: token,
    };
  }

  @action.bound
  async fetchFeeInfo() {
    const wallet = storeWallet.currentWallet;
    const accountInfo = storeAccount.currentAccountInfo;
    const tx = await wallet.createGeneralTransferTxObject({
      accountInfo,
      ...this.previewPayload,
    });
    try {
      const feeInfo = await wallet.fetchTransactionFeeInfo(tx);
      this.feeInfo = feeInfo || {};
      console.log(this.feeInfo);
    } catch (ex) {
      console.error(ex);
      this.feeInfo = {};
      // user input previewPayload may be invalid, catch error here
    }
  }

  fetchFeeInfoDebounce = debounce(this.fetchFeeInfo, 600).bind(this);

  @action.bound
  async previewTransfer() {
    const wallet = storeWallet.currentWallet;

    const { fee } = this;
    const { amount, tokenInfo: token, to: toAddress } = this.previewPayload;

    // * all fields are empty
    if (!token || !toAddress || !amount) {
      return null;
    }

    // * address is valid;
    // * token address is valid;
    if (!wallet.isValidAddress(toAddress)) {
      utilsToast.toast.error('收款地址不正确');
      return null;
    }

    // * amount is > 0
    // * amount is valid number
    if (
      !utilsNumber.isValidNumber(amount) ||
      utilsNumber.bigNum(amount).lte(0)
    ) {
      utilsToast.toast.error('转账金额不正确');
      return null;
    }

    // * amount is < ( balance - fee - createTokenFee )
    const maxAmount = this.getTransferMaxAmount(token);
    if (utilsNumber.bigNum(amount).gt(maxAmount)) {
      utilsToast.toast.error('转账余额不足');
      return null;
    }

    // * nativeToken (SOL) balance is insufficient
    if (
      (storeToken.currentNativeTokenBalance.balance <= 0 && fee > 0) ||
      storeToken.currentNativeTokenBalance.balanceNormalized < fee
    ) {
      utilsToast.toast.error('手续费余额不足');
      return null;
    }

    return true;
  }

  @action.bound
  async doTransfer() {
    const wallet = storeWallet.currentWallet;
    const accountInfo = storeAccount.currentAccountInfo;
    // TODO add global loading toast
    // * get token address from native address
    // * create ATA token for receipt if token not associated (activated)
    // * test if mint address is same
    const tx = await wallet.createGeneralTransferTxObject({
      accountInfo,
      ...this.previewPayload,
    });
    // TODO always fetch latest tx feeInfo onChain before submit,
    //      this value will be different in preview feeInfo
    const feeInfo = await wallet.fetchTransactionFeeInfo(tx);
    const txid = await wallet.transfer({
      accountInfo,
      tx,
      feeInfo,
    });
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
  clearData() {
    this.amount = '';
    this.toAddress = '';
    this.feeInfo = {};
  }
}

global._storeTransfer = new StoreTransfer();
export default global._storeTransfer;
