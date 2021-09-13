import assert from 'assert';
import { isNil, toLower } from 'lodash';
import {
  CONST_ADD_TOKEN_MODE,
  CONST_HARDWARE_MODELS,
  CONSTS_ACCOUNT_TYPES,
} from '../consts/consts';
import utilsApp from '../utils/utilsApp';
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
      accountInfo,
      chainInfo,
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

  chainManager = new ChainManagerBase(this.options);

  hdkeyManager = new HdKeyManagerBase(this.options);

  get keyringProxy() {
    this._keyringProxy = this._keyringProxy || new KeyringBgProxy(this.options);
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

  // TODO pass txObject to estimate fee
  getTransactionFee() {
    return this.chainManager.getTransactionFee();
  }

  async getTxHistory({ ...others }) {
    return this.chainManager.getTxHistory({ ...others });
  }

  // transfer ----------------------------------------------

  async transfer({
    account,
    from,
    to,
    amount,
    decimals,
    contract,
    isToken = false,
  }) {
    // TODO accountName: feePayer, signer, creator
    const accountInfo = account || this.accountInfo;

    assert(accountInfo, 'transfer tx need account to sign');

    // const { decimals, mint } = balanceInfo;
    const _decimals = isNil(decimals) ? this.options.balanceDecimals : decimals;
    // decimals convert
    // TODO bignumber
    const _amount = Math.round(parseFloat(amount) * 10 ** _decimals);
    const _from = from || accountInfo.address;

    console.log('transfer', {
      accountInfo,
      _from,
      to,
      _amount,
      _decimals,
      contract,
      isToken,
    });

    let tx = null;
    if (isToken) {
      // transfer token
      tx = await this.createTransferTokenTxObject({
        accountInfo,
        from: _from,
        to,
        amount: _amount,
        decimals: _decimals,
        contract,
      });
    } else {
      // transfer native token
      tx = await this.createTransferTxObject({
        accountInfo,
        to,
        amount: _amount,
      });
    }
    const txid = await this.signAndSendTxObject({ accountInfo, tx });
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

  // getLatestNonce
  // get fee from gasNow
  // signMultipleTx
  isValidAddress({ address }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // decode dapp tx data
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
