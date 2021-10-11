import { PrivateKeyAccount, Transaction } from 'js-conflux-sdk';
import {
  KeyringHdBase,
  KeyringPickerBase,
  KeyringToolsBase,
} from '../../KeyringBase';
import { CONSTS_ACCOUNT_TYPES } from '../../../consts/consts';
import optionsHelper from '../../optionsHelper';
import utilsApp from '../../../utils/utilsApp';
import HdKeyManager from './managers/HdKeyManager';

global.$ok_confluxPrivateKeyAccount = PrivateKeyAccount;

class KeyringTools extends KeyringToolsBase {
  privateKeyToAccount({ privateKey }) {
    const networkId = optionsHelper.getChainId(this.options);
    const privateKeyHex = utilsApp.bufferToHex(privateKey);
    const account = new PrivateKeyAccount(privateKeyHex, networkId);
    return account;
  }

  privateKeyToAddress({ privateKey }) {
    const account = this.privateKeyToAccount({ privateKey });
    return account.address;
  }

  privateKeySign({ privateKey, tx }) {
    const networkId = optionsHelper.getChainId(this.options);
    const transaction = new Transaction(JSON.parse(tx));
    transaction.sign(privateKey, networkId); // sender privateKey
    return transaction.serialize();
  }

  privateKeyToString({ privateKey }) {
    const account = this.privateKeyToAccount({
      privateKey,
    });
    return account.privateKey;
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
