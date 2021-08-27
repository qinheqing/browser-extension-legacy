import assert from 'assert';
import {
  CONST_CHAIN_KEYS,
  CONST_ETH,
  CONST_HARDWARE_MODELS,
  CONST_SOL,
  CONST_CFX,
} from '../consts/consts';
import WalletSOL from './providers/SOL/Wallet';
import WalletCFX from './providers/CFX/Wallet';

// TODO cache expire feature
const walletsCacheMap = {};

function createWallet(options) {
  assert(
    options?.chainInfo,
    'Wallet init needs options.chainInfo that includes baseChain',
  );
  const baseChain = options?.chainInfo?.baseChain;
  let wallet = null;
  switch (baseChain) {
    case CONST_CHAIN_KEYS.BTC:
      break;
    case CONST_CHAIN_KEYS.ETH:
      break;
    case CONST_CHAIN_KEYS.SOL:
      wallet = new WalletSOL(options);
      global.$$walletSOL = wallet;
      break;
    case CONST_CHAIN_KEYS.CFX:
      wallet = new WalletCFX(options);
      break;
    default:
      break;
  }

  if (wallet) {
    return wallet;
  }
  throw new Error(`No Wallet class match for baseChain=${baseChain}`);
  // return new WalletBase(options);
}

export default {
  createWallet,
};
