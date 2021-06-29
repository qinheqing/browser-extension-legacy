import { CONST_CHAIN_KEYS } from '../consts/consts';
import KeyringSOL from './SOL/KeyringSOL';

function createKeyring(options) {
  const baseChain = options?.chainInfo?.baseChain;
  switch (baseChain) {
    case CONST_CHAIN_KEYS.BTC:
      throw new Error('BTC Keyring not found');
    case CONST_CHAIN_KEYS.ETH:
      throw new Error('ETH Keyring not found');
    case CONST_CHAIN_KEYS.SOL:
      return new KeyringSOL(options);
    default:
      break;
  }
  throw new Error(`No Keyring class match for baseChain=${baseChain}`);
}

export default {
  createKeyring,
};
