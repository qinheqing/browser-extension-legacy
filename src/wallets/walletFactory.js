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
let walletsCacheMap = {};

function createCacheKey({ chainInfo, accountInfo }) {
  // eslint-disable-next-line no-param-reassign
  chainInfo = chainInfo || {};
  // eslint-disable-next-line no-param-reassign
  accountInfo = accountInfo || {};
  return `${chainInfo.baseChain}_${chainInfo.key}__${accountInfo.type}_${accountInfo.address}_${accountInfo.path}`;
}

function createWallet(options = {}, { cache = false } = {}) {
  const { chainInfo, accountInfo } = options;
  assert(
    chainInfo,
    'Wallet init needs options.chainInfo that includes baseChain',
  );
  const baseChain = chainInfo?.baseChain;
  let wallet = null;
  let cacheKey = '';

  if (cache) {
    cacheKey = createCacheKey({ chainInfo, accountInfo });
    wallet = walletsCacheMap[cacheKey]?.instance;
    if (wallet) {
      return wallet;
    }
  }

  switch (baseChain) {
    case CONST_CHAIN_KEYS.BTC:
      break;
    case CONST_CHAIN_KEYS.ETH:
      break;
    case CONST_CHAIN_KEYS.SOL:
      wallet = new WalletSOL(options);
      global.$ok_solWallet = wallet;
      break;
    case CONST_CHAIN_KEYS.CFX:
      wallet = new WalletCFX(options);
      break;
    default:
      break;
  }

  if (wallet) {
    if (cache && cacheKey) {
      // cache only last single instance
      walletsCacheMap = {};
      walletsCacheMap[cacheKey] = {
        lastUpdate: Date.now(),
        instance: wallet,
      };
    }
    return wallet;
  }
  throw new Error(`No Wallet class match for baseChain=${baseChain}`);
  // return new WalletBase(options);
}

export default {
  createWallet,
};
