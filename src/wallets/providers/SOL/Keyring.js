import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Account, PublicKey } from '@solana/web3.js';
import {
  KeyringToolsBase,
  KeyringHdBase,
  KeyringPickerBase,
  KeyringHardwareBase,
} from '../../KeyringBase';

import { CONSTS_ACCOUNT_TYPES } from '../../../consts/consts';
import HdKeyManager from './managers/HdKeyManager';

class KeyringTools extends KeyringToolsBase {
  _solAccountFromPrivateKey({ privateKey }) {
    return new Account(nacl.sign.keyPair.fromSeed(privateKey).secretKey);
  }

  privateKeySign({ privateKey, tx }) {
    const account = this._solAccountFromPrivateKey({ privateKey });
    const txBytes = bs58.decode(tx);
    return bs58.encode(nacl.sign.detached(txBytes, account.secretKey));
  }

  privateKeyToAddress({ privateKey }) {
    const account = this._solAccountFromPrivateKey({ privateKey });
    const address = new PublicKey(account.publicKey).toString();
    return address;
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

  async getAccountPrivateKey({ seed, path }) {
    const hdPrivateKey = await this._getHdPrivateKey({ seed, path });
    const account = this.keyringTools._solAccountFromPrivateKey({
      privateKey: hdPrivateKey,
    });
    return bs58.encode(account.secretKey);
  }
}

class KeyringHardware extends KeyringHardwareBase {
  get hdkeyManager() {
    this._hdkeyManager = this._hdkeyManager || new HdKeyManager(this.options);
    return this._hdkeyManager;
  }
}

class KeyringPicker extends KeyringPickerBase {
  keyrings = {
    [CONSTS_ACCOUNT_TYPES.Wallet]: KeyringHd,
    [CONSTS_ACCOUNT_TYPES.Hardware]: KeyringHardware,
    // [CONSTS_ACCOUNT_TYPES.Hardware]: KeyringHardwareBase,
    // [CONSTS_ACCOUNT_TYPES.SingleChain]: KeyringSingleChainBase,
    // [CONSTS_ACCOUNT_TYPES.WatchOnly]: KeyringWatchedBase,
  };
}

export { KeyringHd, KeyringPicker };
