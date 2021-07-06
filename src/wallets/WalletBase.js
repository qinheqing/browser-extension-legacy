import assert from 'assert';
import { isNil, toLower } from 'lodash';
import { CONST_HARDWARE_MODELS, CONSTS_ACCOUNT_TYPES } from '../consts/consts';
import utilsApp from '../utils/utilsApp';
import ChainProviderBase from './ChainProviderBase';
import HardwareProviderBase from './HardwareProviderBase';
import { HdKeyProviderBase } from './HdKeyProvider';
import { UiBackgroundProxy } from './bg/UiBackgroundProxy';
import KeyringBase from './KeyringBase';

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
    this.options = {
      ...this.optionsDefault,
      ...options,
    };
  }

  get optionsDefault() {
    return {};
  }

  options = {};

  // TODO remove
  hdPathCustomTemplate = '';

  hardwareModel = CONST_HARDWARE_MODELS.Unknown;

  hardwareProvider = new HardwareProviderBase(this.options); // OneKeyConnect

  chainProvider = new ChainProviderBase(this.options);

  hdkeyProvider = new HdKeyProviderBase(this.options);

  keyring = new KeyringBase(this.options);

  bgProxy = new UiBackgroundProxy();

  // TODO rename to hdkeyProvider
  hdkey = null; // new HDKey()

  // TODO rename to accountInfo.baseChain
  get hdCoin() {
    return utilsApp.throwToBeImplemented(this);
  }

  get hdCoinLowerCase() {
    return toLower(this.hdCoin);
  }

  get accountType() {
    return this.accountInfo?.type;
  }

  get accountHdPath() {
    return this.accountInfo?.path;
  }

  // utils ----------------------------------------------

  keyringProxyCall({ method, params }) {
    return this.bgProxy.keyringProxyCall({
      options: { ...this.options, isAtBackground: true },
      method,
      params,
    });
  }

  // address ----------------------------------------------

  /**
   *
   * @param index
   * @return
    "hardwareModel": "onekey",
   "hdCoin": "ETH",
   "hdPathIndex": 0,
   "hdPathTemplate": "m/44'/60'/0'/0/{{index}}",
   "hdPath": "m/44'/60'/0'/0/0",
   */
  buildAddressMeta({ index, hdPath, ...others }) {
    return this.keyring.buildAddressMeta({ index, hdPath, ...others });
  }

  async getAddresses({ indexes = [0], ...others }) {
    // TODO refactor to keyringController.getAddresses
    //    - HdWalletKeyring.getAddresses
    //    - HardwareKeyring.getAddresses
    //    - SingleChainKeyring.getAddresses
    if (this.accountType === CONSTS_ACCOUNT_TYPES.Wallet) {
      return this.getAddressesByHdWallet({ indexes, ...others });
    }
    if (this.accountType === CONSTS_ACCOUNT_TYPES.Hardware) {
      return this.getAddressesByHardware({ indexes, ...others });
    }
    throw new Error(
      `getAddresses of accountType ${this.accountType} is not supported`,
    );
  }

  async getAddressesByHdWallet({ indexes = [0], ...others }) {
    return this.keyringProxyCall({
      method: 'getAddressesByHdWallet',
      params: { indexes, ...others },
    });
  }

  async getAddressesByHardware({ indexes = [0] }) {
    const bundle = indexes.map((index) => ({
      path: this.hdkeyProvider.createHdPath({ index }),
      showOnTrezor: false,
    }));
    const params = {
      coin: this.hdCoinLowerCase,
      bundle,
    };
    const { id, success, payload } = await this.hardwareProvider.getAddress(
      params,
    );
    console.log({
      req: {
        params,
      },
      res: {
        id,
        success,
        payload,
      },
    });
    if (success) {
      return payload.map((data, i) => {
        /*
          "path": [1,2,3,4,5]
          "serializedPath": "m/44'/60'/0'/0/0",
          "address": "0x99F825D80cADd21D77D13B7e13D25960B40a6299",
         */
        const { serializedPath, address } = data;
        return {
          address,
          ...this.buildAddressMeta({
            index: indexes[i],
            hdPath: serializedPath,
          }),
        };
      });
    }
    return [];
  }

  // transaction ----------------------------------------------

  // tx is String
  async signTx(txStr) {
    const hdPath = this.accountHdPath;
    if (this.accountType === CONSTS_ACCOUNT_TYPES.Wallet) {
      return this.signTxByHdWallet({ tx: txStr, hdPath });
    }
    if (this.accountType === CONSTS_ACCOUNT_TYPES.Hardware) {
      return this.signTxByHardware({ tx: txStr, hdPath });
    }
    throw new Error(
      `signTx of accountType ${this.accountType} is not supported`,
    );
  }

  // tx is String
  async signTxByHardware({ tx, hdPath, ...others }) {
    return this.hardwareProvider.signTransaction({
      tx,
      hdPath,
      ...others,
    });
  }

  // tx is String
  async signTxByHdWallet({ tx, hdPath, ...others }) {
    return this.keyringProxyCall({
      method: 'signTxByHdWallet',
      params: { tx, hdPath, ...others },
    });
  }

  // tx is String
  async sendTx(txStr) {
    const txid = await this.chainProvider.sendTransaction({
      rawTransaction: txStr,
    });
    return txid;
  }

  // tx is object, return txid
  async signAndSendTxObject({ accountInfo, tx }) {
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
  async createAddAssociateTokenTxObject({ accountInfo, contract }) {
    return utilsApp.throwToBeImplemented(this);
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
      tx = await this.createTransferTokenTxObject({
        accountInfo,
        from: _from,
        to,
        amount: _amount,
        decimals: _decimals,
        contract,
      });
    } else {
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
    const tx = await this.createAddAssociateTokenTxObject({
      accountInfo,
      contract,
    });
    const txid = await this.signAndSendTxObject({ accountInfo, tx });
    return txid;
  }

  // ----------------------------------------------

  async requestAirdrop() {
    return utilsApp.throwToBeImplemented(this);
  }

  // getLatestNonce
  // get fee from gasNow
  // signMultipleTx
  // isValidAddress
}

export default WalletBase;
