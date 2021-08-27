import assert from 'assert';
import { CONST_CHAIN_KEYS } from '../consts/consts';
import { KeyringPicker as KeyringPickerSOL } from './providers/SOL/Keyring';
import { KeyringPicker as KeyringPickerCFX } from './providers/CFX/Keyring';

// TODO memoize cache keyring
//  https://github.com/alexreardon/memoize-one
function createKeyring(options) {
  assert(
    options?.chainInfo,
    'Keyring init needs options.chainInfo that includes baseChain',
  );
  let keyring = null;
  const baseChain = options?.chainInfo?.baseChain;
  switch (baseChain) {
    case CONST_CHAIN_KEYS.BTC:
      throw new Error('BTC Keyring not found');
    case CONST_CHAIN_KEYS.ETH:
      throw new Error('ETH Keyring not found');
    case CONST_CHAIN_KEYS.SOL:
      keyring = new KeyringPickerSOL().create(options);
      break;
    case CONST_CHAIN_KEYS.CFX:
      keyring = new KeyringPickerCFX().create(options);
      break;
    default:
      break;
  }

  if (keyring) {
    return keyring;
  }
  throw new Error(`No Keyring class match for baseChain=${baseChain}`);
}

export default {
  createKeyring,
};
