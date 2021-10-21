import { toLower } from 'lodash';
import utilsApp from '../utils/utilsApp';
import {
  BACKGROUND_PROXY_MODULE_NAMES,
  CONSTS_ACCOUNT_TYPES,
} from '../consts/consts';
import bgGetRootController from './bg/bgGetRootController';
import { HdKeyManagerBase } from './HdKeyManager';
import { UiBackgroundProxy } from './bg/uiBackgroundProxy';

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

  // getAddressesByHdWallet
  getAddresses() {
    return utilsApp.throwToBeImplemented(this);
  }

  // signTxByHdWallet
  signTransaction() {
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
    const dpath = await this.hdkeyManager.derivePath({ seed: _seed, path });
    return dpath.privateKey;
  }

  async getAccountPrivateKey({ seed, path }) {
    const privateKey = await this._getHdPrivateKey({ seed, path });
    return this.keyringTools.privateKeyToString({ privateKey });
  }

  async getAddresses({ indexes = [0], hdPaths = [], ...others }) {
    const hdPathList = hdPaths.length
      ? hdPaths
      : indexes.map((index) => this.hdkeyManager.createHdPath({ index }));
    const seed = await this._getHdRootSeed();
    const addresses = await Promise.all(
      hdPathList.map(async (path, i) => {
        const privateKey = await this._getHdPrivateKey({ seed, path });
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
    return this.keyringTools.privateKeySign({ privateKey, tx });
  }
}

// run in background
class KeyringSingleChainBase extends KeyringBase {}

// run in background
class KeyringHardwareBase extends KeyringBase {}

// run in background
class KeyringWatchOnlyBase extends KeyringBase {}

// run in background
class KeyringPickerBase {
  keyrings = {
    [CONSTS_ACCOUNT_TYPES.Wallet]: KeyringHdBase,
    [CONSTS_ACCOUNT_TYPES.Hardware]: KeyringHardwareBase,
    [CONSTS_ACCOUNT_TYPES.SingleChain]: KeyringSingleChainBase,
    [CONSTS_ACCOUNT_TYPES.WatchOnly]: KeyringWatchOnlyBase,
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

// run in ui
class KeyringUiToBgProxy extends UiBackgroundProxy {
  constructor(options) {
    super(options);
    this.options = options;
  }

  async keyringProxyCall({ method, params }) {
    return this.baseProxyCall({
      module: BACKGROUND_PROXY_MODULE_NAMES.keyring,
      options: this.options,
      method,
      params,
    });
  }

  async getAddresses({ indexes = [0], ...others }) {
    return this.keyringProxyCall({
      method: 'getAddresses',
      params: { indexes, ...others },
    });
  }

  async signTransaction({ tx, hdPath, ...others }) {
    return this.keyringProxyCall({
      method: 'signTransaction',
      params: { tx, hdPath, ...others },
    });
  }

  async getAccountPrivateKey({ path, ...others }) {
    return this.keyringProxyCall({
      method: 'getAccountPrivateKey',
      params: { path, ...others },
    });
  }
}

export {
  KeyringToolsBase,
  KeyringPickerBase,
  KeyringHdBase,
  KeyringHardwareBase,
  KeyringSingleChainBase,
  KeyringWatchOnlyBase,
  KeyringUiToBgProxy,
};
