import assert from 'assert';
import { isNil, toLower } from 'lodash';
import {
  CONST_ADD_TOKEN_MODE,
  CONST_HARDWARE_MODELS,
  CONSTS_ACCOUNT_TYPES,
} from '../consts/consts';
import utilsApp from '../utils/utilsApp';
import utilsNumber from '../utils/utilsNumber';
import ChainManagerBase from './ChainManagerBase';
import { HdKeyManagerBase } from './HdKeyManager';
import uiBackgroundProxy from './bg/uiBackgroundProxy';
import { KeyringBgProxy } from './KeyringBase';
import optionsHelper from './optionsHelper';

class WalletBase {
  constructor(options = {}) {
    const {
      // TODO chainInfo, accountInfo
      hardwareModel = CONST_HARDWARE_MODELS.Unknown,
      hdPath,
      chainInfo,
      accountInfo,
      ...others
    } = options;
    // TODO merge to options, remove
    this.hardwareModel = hardwareModel;
    this.hdPathCustomTemplate = hdPath;
    this.chainInfo = chainInfo; // required
    this.accountInfo = accountInfo;
    this.baseChain = chainInfo?.baseChain ?? '';
    this.options = {
      ...this.optionsDefault,
      ...options,
      balanceDecimals: chainInfo?.nativeToken?.decimals,
      hdPathTemplate: chainInfo?.hdPathTemplate,
    };
  }

  get optionsDefault() {
    return {};
  }

  options = {};

  // TODO remove
  hdPathCustomTemplate = '';

  hardwareModel = CONST_HARDWARE_MODELS.Unknown;

  chainManager = new ChainManagerBase(this.options, this);

  hdkeyManager = new HdKeyManagerBase(this.options, this);

  get keyringProxy() {
    this._keyringProxy =
      this._keyringProxy || new KeyringBgProxy(this.options, this);
    return this._keyringProxy;
  }

  get accountType() {
    return this.accountInfo?.type;
  }

  get accountHdPath() {
    return this.accountInfo?.path;
  }

  get addTokenMode() {
    return optionsHelper.getAddTokenMode(this.options);
  }

  get isLocalAddTokenMode() {
    return this.addTokenMode === CONST_ADD_TOKEN_MODE.LOCAL;
  }

  get isChainAddTokenMode() {
    return this.addTokenMode === CONST_ADD_TOKEN_MODE.CHAIN;
  }

  // utils ----------------------------------------------

  // address ----------------------------------------------

  async getAddresses({ indexes = [0], ...others }) {
    // this.accountType === CONSTS_ACCOUNT_TYPES.Wallet
    return this.keyringProxy.getAddresses({
      indexes,
      ...others,
    });
  }

  // transaction ----------------------------------------------

  // tx is String
  async signTx(txStr) {
    const hdPath = this.accountHdPath;

    // tx is String
    return this.keyringProxy.signTransaction({
      tx: txStr,
      hdPath,
    });
  }

  // tx is String
  async sendTx(txStr) {
    const txid = await this.chainManager.sendTransaction({
      rawTransaction: txStr,
    });
    return txid;
  }

  // tx is object, return txid
  async signAndSendTxObject({ accountInfo, tx }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async serializeTxObject(tx) {
    return utilsApp.throwToBeImplemented(this);
  }

  // return tx object
  async createTransferTokenTxObject({
    accountInfo,
    from,
    to,
    amount,
    decimals,
    contract,
  }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // return tx object
  async createTransferTxObject({ accountInfo, to, amount }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // return tx object
  async createAddTokenTxObject({ accountInfo, contract }) {
    return utilsApp.throwToBeImplemented(this);
  }

  fetchTransactionFeeInfo(tx) {
    return this.chainManager.fetchTransactionFeeInfo(tx);
  }

  async getTxHistory({ ...others }) {
    return this.chainManager.getTxHistory({ ...others });
  }

  // transfer ----------------------------------------------

  async createGeneralTransferTxObject({
    accountInfo,
    from,
    to,
    amount,
    decimals,
    contract,
    isToken = false,
  }) {
    // eslint-disable-next-line no-param-reassign
    accountInfo = accountInfo || this.accountInfo;

    assert(accountInfo, 'transfer tx need account to sign');

    // const { decimals, mint } = balanceInfo;
    const _decimals = isNil(decimals) ? this.options.balanceDecimals : decimals;
    // decimals convert unit
    let _amountUnit = utilsNumber.parseUnits(amount, decimals);
    _amountUnit = utilsNumber.toNormalNumber({
      value: _amountUnit,
      roundMode: 'floor',
      nanText: null,
    });
    _amountUnit = _amountUnit ?? undefined;

    const _from = from || accountInfo.address;

    console.log('transfer', {
      accountInfo,
      _from,
      to,
      _amount: _amountUnit,
      _decimals,
      contract,
      isToken,
    });

    let tx = null;
    if (isToken) {
      // transfer erc20 token
      tx = await this.createTransferTokenTxObject({
        accountInfo,
        to,
        amount: _amountUnit,
        contract,
        from: _from,
        decimals: _decimals,
      });
    } else {
      // transfer native token
      tx = await this.createTransferTxObject({
        accountInfo,
        to,
        amount: _amountUnit,
      });
    }
    return tx;
  }

  async addFeeInfoToTx({ tx, feeInfo }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async transfer({ tx, feeInfo, accountInfo }) {
    const txWithFeeInfo = await this.addFeeInfoToTx({
      tx,
      feeInfo,
    });
    const txid = await this.signAndSendTxObject({
      accountInfo,
      tx: txWithFeeInfo,
    });
    return txid;
  }

  // token ----------------------------------------------

  // TODO if account create this token, then it can add it too,
  //      so we can see two Token with the same mint address, may be a bug
  async addAssociateToken({ account, contract }) {
    const accountInfo = account || this.accountInfo;
    const tx = await this.createAddTokenTxObject({
      accountInfo,
      contract,
    });
    const txid = await this.signAndSendTxObject({ accountInfo, tx });
    return txid;
  }

  // ----------------------------------------------

  async getAccountPrivateKey({ path, ...others }) {
    return this.keyringProxy.getAccountPrivateKey({
      path,
      ...others,
    });
  }

  async requestAirdrop() {
    return utilsApp.throwToBeImplemented(this);
  }

  // TODO move isValidAddress to new class Utils
  //    isValidAddress() is public, do something like parameter convert, result convert and catch
  //    then call private method _isValidAddress() which needs to be implemented by subClass

  // getLatestNonce
  // get fee from gasNow
  // signMultipleTx
  isValidAddress(address = '') {
    return utilsApp.throwToBeImplemented(this);
  }

  // decode tx data message from dapp
  decodeTransactionData({ address, data }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // TODO rename browser to explorer
  getBlockBrowserLink({ tx, account, token, block }) {
    const { chainInfo } = this.options;
    const browserLinks = chainInfo?.browser?.[0];

    assert(browserLinks, 'chainInfo.browser NOT exists');
    assert(browserLinks.tx, 'chainInfo.browser.tx NOT exists');
    assert(browserLinks.account, 'chainInfo.browser.account NOT exists');
    assert(browserLinks.token, 'chainInfo.browser.token NOT exists');
    assert(browserLinks.block, 'chainInfo.browser.block NOT exists');
    assert(browserLinks.home, 'chainInfo.browser.home NOT exists');

    if (tx) {
      return utilsApp.formatTemplate(browserLinks.tx, { tx });
    }

    if (account) {
      return utilsApp.formatTemplate(browserLinks.account, { account });
    }

    if (token) {
      return utilsApp.formatTemplate(browserLinks.token, { token });
    }

    if (block) {
      return utilsApp.formatTemplate(browserLinks.block, { block });
    }
    return browserLinks.home || utilsApp.throwToBeImplemented(this);
  }
}

export default WalletBase;
