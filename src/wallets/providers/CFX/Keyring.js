import { PrivateKeyAccount } from 'js-conflux-sdk';
import {
  KeyringHdBase,
  KeyringPickerBase,
  KeyringToolsBase,
} from '../../KeyringBase';
import { CONSTS_ACCOUNT_TYPES } from '../../../consts/consts';
import HdKeyManager from './managers/HdKeyManager';

class KeyringTools extends KeyringToolsBase {
  privateKeyToAddress({ privateKey }) {
    const account = new PrivateKeyAccount(privateKey);
    return account.address;
  }
}

class KeyringHd extends KeyringHdBase {
  get hdkeyManager() {
    this._hdkeyManager = this._hdkeyManager || new HdKeyManager(this.options);
    return this._hdkeyManager;
  }

  get keyringTools() {
    this._keyringTools = this._keyringTools || new KeyringTools(this.options);
    return this._keyringTools;
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
