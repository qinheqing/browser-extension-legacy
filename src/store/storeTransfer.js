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
import utilsStorage from '../utils/utilsStorage';
import BaseStore from './BaseStore';
import storeBalance from './storeBalance';
import storeWallet from './storeWallet';
import storeHistory from './storeHistory';
import storeToken from './storeToken';
import storeTx from './storeTx';
import storeAccount from './storeAccount';
import createAutoRun from './createAutoRun';
import BaseStoreWithStorage from './BaseStoreWithStorage';

class StoreTransfer extends BaseStoreWithStorage {
  constructor(props) {
    super(props);
    this.storageNamespace = utilsStorage.STORAGE_NAMESPACES.transfer;

    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    this.autosave('fromToken', { useLocalStorage: true });
  }

  autoRunFetchFeeInfo = createAutoRun(
    () => {
      const payload = this.previewPayload;
      if (payload && payload.to) {
        this.fetchTransferFeeInfoDebounce();
      }
    },
    () => {
      const payload = this.previewPayload;
    },
  );

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
    if (!token) {
      return {};
    }
    const decimals = storeToken.getTokenDecimals(token);

    return {
      decimals,
      amount: this.amount,
      to: toAddress,
      contract: token.contractAddress,
      from: token.address,
      // TODO change isToken, isNative to isNativeToken
      isToken: !token.isNative,
      tokenInfo: token,
    };
  }

  @action.bound
  async fetchFeeInfo(tx) {
    const wallet = storeWallet.currentWallet;
    try {
      const feeInfo = await wallet.fetchTransactionFeeInfo(tx);
      return feeInfo || {};
    } catch (ex) {
      // user input previewPayload may be invalid, catch error here
      console.error(ex);
      return {};
    }
  }

  @action.bound
  async fetchTransferFeeInfo() {
    const wallet = storeWallet.currentWallet;
    const accountInfo = storeAccount.currentAccountInfo;
    try {
      const tx = await wallet.createGeneralTransferTxObject({
        accountInfo,
        ...this.previewPayload,
      });
      this.feeInfo = await this.fetchFeeInfo(tx);
    } catch (error) {
      console.error('fetchTransferFeeInfo ERROR: ', error);
      this.feeInfo = {};
    }
  }

  fetchTransferFeeInfoDebounce = debounce(this.fetchTransferFeeInfo, 600).bind(
    this,
  );

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
      utilsToast.toast.error('?????????????????????');
      return null;
    }

    // * amount is > 0
    // * amount is valid number
    if (
      !utilsNumber.isValidNumber(amount) ||
      utilsNumber.bigNum(amount).lte(0)
    ) {
      utilsToast.toast.error('?????????????????????');
      return null;
    }

    // * amount is < ( balance - fee - createTokenFee )
    const maxAmount = this.getTransferMaxAmount(token);
    if (utilsNumber.bigNum(amount).gt(maxAmount)) {
      utilsToast.toast.error('??????????????????');
      return null;
    }

    // * nativeToken (SOL) balance is insufficient
    if (
      (storeToken.currentNativeTokenBalance.balance <= 0 && fee > 0) ||
      storeToken.currentNativeTokenBalance.balanceNormalized < fee
    ) {
      utilsToast.toast.error('?????????????????????');
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
    const txid = await wallet.transfer({
      accountInfo,
      tx,
      feeInfo: this.feeInfo,
    });
    if (txid) {
      utilsToast.toastTx({ txid, message: '??????????????????' });
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
