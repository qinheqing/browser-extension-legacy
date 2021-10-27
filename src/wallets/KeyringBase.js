import { toLower, isString } from 'lodash';
import logger from 'loglevel';
import utilsApp from '../utils/utilsApp';
import { CONST_ACCOUNT_TYPES } from '../consts/consts';
import bgGetRootController from './bg/bgGetRootController';
import { HdKeyManagerBase } from './HdKeyManager';
import optionsHelper from './helpers/optionsHelper';

// run in background
class KeyringToolsBase {
  constructor(options, wallet) {
    this.options = options;
    this.wallet = wallet;
  }

  // hdPrivateKey -> chain sdk account
  privateKeyToAccount({ privateKey }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // hdPrivateKey -> address
  privateKeyToAddress({ privateKey }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // hdPrivateKey sign
  privateKeySign({ privateKey, tx }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // hdPrivateKey -> chain sdk account privateKey
  privateKeyToString({ privateKey }) {
    return utilsApp.throwToBeImplemented(this);
  }
}

// run in background
class KeyringBase {
  constructor(options) {
    this.options = options;
  }

  get hdkeyManager() {
    this._hdkeyManager =
      this._hdkeyManager || new HdKeyManagerBase(this.options);
    return this._hdkeyManager;
  }

  get keyringTools() {
    this._keyringTools =
      this._keyringTools || new KeyringToolsBase(this.options);
    return this._keyringTools;
  }

  /**
   *
   * @param index
   * @return
    "hardwareModel": "onekey",
   "hdPathIndex": 0,
   "hdPathTemplate": "m/44'/60'/0'/0/{{index}}",
   "hdPath": "m/44'/60'/0'/0/0",
   */
  buildAddressMeta({ index, hdPath } = {}) {
    // AddressInfo?  AccountInfo?
    return {
      // address
      chainKey: this.options?.chainInfo?.key, // read from chainInfo
      // name
      // TODO remove ----------------------------------------------
      type: this.options?.accountInfo?.type,
      hardwareModel: this.options?.accountInfo?.hardwareModel, // read from accountInfo
      baseChain: this.options?.chainInfo?.baseChain, // read from chainInfo.baseChain
      hdPathIndex: index,
      path: hdPath || this.hdkeyManager.createHdPath({ index }),
      hdPathTemplate: this.hdkeyManager.hdPathTemplate,
    };
  }

  async getAccountPrivateKey({ seed, path }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async getAddresses() {
    return utilsApp.throwToBeImplemented(this);
  }

  // sign single transaction ONLY
  async signTransaction() {
    return utilsApp.throwToBeImplemented(this);
  }

  // TODO sign multiple transaction
  async signAllTransactions() {
    return utilsApp.throwToBeImplemented(this);
  }
}

// run in background
class KeyringHdBase extends KeyringBase {
  async _getHdRootSeed() {
    const appHdAccount =
      bgGetRootController().keyringController.getKeyringsByType(
        'HD Key Tree',
      )?.[0];
    const { mnemonic } = appHdAccount;
    const seed = await this.hdkeyManager.mnemonicToSeed({ mnemonic });
    if (!seed || !mnemonic) {
      throw new Error('mnemonic seed can not be empty');
    }
    return seed;
  }

  async _getHdPrivateKey({ seed, path }) {
    const _seed = seed || (await this._getHdRootSeed());
    const dpath = await this.hdkeyManager.derivePath({
      seed: _seed,
      path,
    });
    return dpath.privateKey;
  }

  async getAccountPrivateKey({ seed, path }) {
    const privateKey = await this._getHdPrivateKey({
      seed,
      path,
    });
    return this.keyringTools.privateKeyToString({ privateKey });
  }

  async getAddresses({ indexes = [0], hdPaths = [], ...others }) {
    const hdPathList = hdPaths.length
      ? hdPaths
      : indexes.map((index) => this.hdkeyManager.createHdPath({ index }));
    const seed = await this._getHdRootSeed();
    const addresses = await Promise.all(
      hdPathList.map(async (path, i) => {
        const privateKey = await this._getHdPrivateKey({
          seed,
          path,
        });
        const address = await this.keyringTools.privateKeyToAddress({
          privateKey,
        });
        return {
          address,
          ...this.buildAddressMeta({ index: indexes[i] }),
        };
      }),
    );

    return addresses;
  }

  async signTransaction({ tx, hdPath, ...others }) {
    const privateKey = await this._getHdPrivateKey({ path: hdPath });
    return this.keyringTools.privateKeySign({
      privateKey,
      tx,
    });
  }

  async signAllTransactions() {
    return utilsApp.throwToBeImplemented(this);
  }
}

// run in background
class KeyringHardwareBase extends KeyringBase {
  _onekeyConnect = null;

  // TODO
  parseError() {
    this.callParseError();
    // * Firmware need upgrade
    /*
      code: "Failure_UnexpectedMessage",
      error: "Unknown message"
     */
    //
    // * Need enable BlindSign
    /*
      code: "Failure_DataError",
      error: "Please confirm the BlindSign enabled"
     */
    //
    // * Address NOT matched with sign tx ( SOL only )
    /*
      code: "Failure_DataError",
      error: "Invalid params"
     */
  }

  async getConnectAsync() {
    // DO NOT add this module "@onekeyhq/connect" to package.json,
    //        as two diffent version of connect (keyring) will break
    if (!this._onekeyConnect) {
      this._onekeyConnect = (
        await import('@onekeyhq/eth-onekey-keyring')
      ).default.connect;
    }
    return this._onekeyConnect;
  }

  getCoinParam() {
    const baseChain = optionsHelper.getBaseChain(this.options);
    return toLower(baseChain);
  }

  // eslint-disable-next-line node/handle-callback-err
  async callParseError(error) {
    return utilsApp.throwToBeImplemented(this);
  }

  // TODO rename to absXXXX()
  async callGetAddress({ connect, params }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async callSignTransaction({ connect, params }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async getAccountPrivateKey({ seed, path }) {
    throw new Error('Hardware privateKey exporting is not supported.');
  }

  async getAddresses({ indexes = [0] }) {
    const bundle = indexes.map((index) => ({
      path: this.hdkeyManager.createHdPath({ index }),
      showOnTrezor: false, // deprecate for showOnDevice
      showOnDevice: false,
    }));
    const params = {
      bundle,
      coin: this.getCoinParam(),
      includingFeatures: true,
    };

    // TODO move to hardwareManager
    // TODO OneKeyConnect.getFeatures save deviceId
    // TODO autofix address ( deviceId must be the same )
    // TODO ethereumGetAddress method name is different in each chain
    const connect = await this.getConnectAsync();

    const resHw = await this.callGetAddress({ connect, params });
    const { id, success, payload, device } = resHw;
    logger.info('hardware OneKeyConnect invoke ', {
      req: {
        ...params,
      },
      res: resHw,
    });

    // code: "Method_Interrupted"
    // error: "Popup closed"
    if (!success || (payload && payload.error && payload.code)) {
      let errorMsg = '';
      if (payload.error && isString(payload.error)) {
        errorMsg = errorMsg || payload.error;
      }

      if (payload.code && isString(payload.code)) {
        errorMsg = errorMsg || payload.code;
      }
      errorMsg = errorMsg || 'OneKey hardware connect failed.';
      // should throw hardware string error to Error Object
      const errorObject = new Error(errorMsg);
      // errorObject.ignoreBackgroundErrorNotification = true;
      throw errorObject;
    }

    if (success) {
      return payload.map((data, i) => {
        /*
            "path": [1,2,3,4,5]
            "serializedPath": "m/44'/60'/0'/0/0",
            "address": "0x99F825D80cADd21D77D13B7e13D25960B40a6299",
           */
        const { serializedPath, address } = data;
        return {
          deviceId: device?.features?.device_id ?? '',
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

  async signTransaction({ address, hdPath, tx, deviceId } = {}) {
    // hdPath: "m/44'/501'/0'/0'"
    // tx: "QwE1gc..."
    const coin = this.getCoinParam();
    const connect = await this.getConnectAsync();
    // TODO signAllTransactions by bundle
    const params = {
      bundle: [{ address, path: hdPath, rawTx: tx, showOnDevice: true }],
      coin,
      deviceId,
    };
    const resHw = await this.callSignTransaction({ connect, params });
    const { success, payload } = resHw;
    console.log('hardware signTransaction', resHw);
    // TODO base hardware response and error handle
    if (!success) {
      throw new Error(payload.error || payload.code);
    }
    const signature = payload?.[0]?.signature ?? '';
    return signature;
  }

  async signAllTransactions() {
    return utilsApp.throwToBeImplemented(this);
  }
}

// run in background
class KeyringSingleChainBase extends KeyringBase {}

// run in background
class KeyringWatchOnlyBase extends KeyringBase {}

// run in background
class KeyringPickerBase {
  keyrings = {
    [CONST_ACCOUNT_TYPES.Wallet]: KeyringHdBase,
    [CONST_ACCOUNT_TYPES.Hardware]: KeyringHardwareBase,
    [CONST_ACCOUNT_TYPES.SingleChain]: KeyringSingleChainBase,
    [CONST_ACCOUNT_TYPES.WatchOnly]: KeyringWatchOnlyBase,
  };

  create(options) {
    const accountType = options?.accountInfo?.type;
    const baseChain = options?.chainInfo?.baseChain;
    const KeyringClass = this.keyrings[accountType];
    if (!KeyringClass) {
      throw new Error(
        `NO Keyring class matched for (accountType=${accountType} baseChain=${baseChain})`,
      );
    }

    if (
      [
        KeyringHdBase,
        KeyringHardwareBase,
        KeyringSingleChainBase,
        KeyringWatchOnlyBase,
      ].includes(KeyringClass)
    ) {
      throw new Error(
        `NO Keyring class implemented for (accountType=${accountType} baseChain=${baseChain})`,
      );
    }
    return new KeyringClass(options);
  }
}

export {
  KeyringToolsBase,
  KeyringPickerBase,
  KeyringHdBase,
  KeyringHardwareBase,
  KeyringSingleChainBase,
  KeyringWatchOnlyBase,
};
