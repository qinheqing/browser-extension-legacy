import { KeyringHdBase, KeyringPickerBase } from '../../KeyringBase';
import { CONSTS_ACCOUNT_TYPES } from '../../../consts/consts';
import HdKeyManager from './managers/HdKeyManager';

class KeyringHd extends KeyringHdBase {
  get hdkeyManager() {
    this._hdkeyManager = this._hdkeyManager || new HdKeyManager(this.options);
    return this._hdkeyManager;
  }

  _getAccountFromPrivateKey({ privateKey }) {
    // return account;
  }

  async getAccountPrivateKey({ seed, path }) {
    const hdPrivateKey = await this._getHdPrivateKey({ seed, path });
    const account = this._getAccountFromPrivateKey({
      privateKey: hdPrivateKey,
    });
    // return privateKey;
  }

  privateKeyToAddress({ privateKey }) {
    const account = this._getAccountFromPrivateKey({ privateKey });
    // return address;
  }

  privateKeySign({ privateKey, tx }) {
    const account = this._getAccountFromPrivateKey({ privateKey });
    // return sign;
  }
}

class KeyringPicker extends KeyringPickerBase {
  keyrings = {
    [CONSTS_ACCOUNT_TYPES.Wallet]: KeyringHd,
    // [CONSTS_ACCOUNT_TYPES.Hardware]: KeyringHardwareBase,
    // [CONSTS_ACCOUNT_TYPES.SingleChain]: KeyringSingleChainBase,
    // [CONSTS_ACCOUNT_TYPES.WatchOnly]: KeyringWatchedBase,
  };
}

export { KeyringPicker };
