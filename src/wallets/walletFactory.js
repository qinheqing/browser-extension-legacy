import assert from 'assert';
import {
  CONST_CHAIN_KEYS,
  CONST_ETH,
  CONST_HARDWARE_MODELS,
  CONST_SOL,
} from '../consts/consts';
import WalletETH from './ETH/WalletETH';
import WalletSOL from './SOL/WalletSOL';
import WalletBTC from './BTC/WalletBTC';

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
      wallet = new WalletBTC(options);
      break;
    case CONST_CHAIN_KEYS.ETH:
      wallet = new WalletETH(options);
      break;
    case CONST_CHAIN_KEYS.SOL:
      wallet = new WalletSOL(options);
      global.$$walletSOL = wallet;
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
