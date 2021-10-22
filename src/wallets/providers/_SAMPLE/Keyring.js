import { KeyringHdBase, KeyringPickerBase } from '../../KeyringBase';
import { CONST_ACCOUNT_TYPES } from '../../../consts/consts';
import HdKeyManager from './managers/HdKeyManager';

class KeyringHd extends KeyringHdBase {
  get hdkeyManager() {
    this._hdkeyManager = this._hdkeyManager || new HdKeyManager(this.options);
    return this._hdkeyManager;
  }
}

class KeyringPicker extends KeyringPickerBase {
  keyrings = {
    [CONST_ACCOUNT_TYPES.Wallet]: KeyringHd,
    // [CONST_ACCOUNT_TYPES.Hardware]: KeyringHardwareBase,
    // [CONST_ACCOUNT_TYPES.SingleChain]: KeyringSingleChainBase,
    // [CONST_ACCOUNT_TYPES.WatchOnly]: KeyringWatchedBase,
  };
}

export { KeyringPicker };
