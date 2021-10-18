import { KeyringHdBase, KeyringPickerBase } from '../../KeyringBase';
import { CONSTS_ACCOUNT_TYPES } from '../../../consts/consts';
import HdKeyManager from './managers/HdKeyManager';

class KeyringHd extends KeyringHdBase {
  get hdkeyManager() {
    this._hdkeyManager = this._hdkeyManager || new HdKeyManager(this.options);
    return this._hdkeyManager;
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
