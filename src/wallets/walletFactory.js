import {
  CONST_CHAIN_KEYS,
  CONST_ETH,
  CONST_HARDWARE_MODELS,
  CONST_SOL,
} from '../consts/consts';
import WalletBase from './WalletBase';
import WalletETH from './ETH/WalletETH';
import WalletSOL from './SOL/WalletSOL';
import WalletBTC from './BTC/WalletBTC';

// TODO cache expire feature
const walletsCacheMap = {};

// TODO remove
function getWalletInstance({
  hdCoin = CONST_ETH,
  hardwareModel = CONST_HARDWARE_MODELS.Unknown,
}) {
  const cacheKey = `${hardwareModel}/${hdCoin}`;
  let instance = walletsCacheMap[cacheKey];
  if (!instance) {
    const constructorParams = { hardwareModel };
    switch (hdCoin) {
      case CONST_ETH:
        instance = new WalletETH(constructorParams);
        break;
      case CONST_SOL:
        instance = new WalletSOL(constructorParams);
        break;
      default:
        instance = new WalletBase(constructorParams);
    }
    walletsCacheMap[cacheKey] = instance;
  }
  return instance;
}

function createWallet(options) {
  const baseChain = options?.chainInfo?.baseChain;
  switch (baseChain) {
    case CONST_CHAIN_KEYS.BTC:
      return new WalletBTC(options);
    case CONST_CHAIN_KEYS.ETH:
      return new WalletETH(options);
    case CONST_CHAIN_KEYS.SOL:
      return new WalletSOL(options);
    default:
      break;
  }
  throw new Error(`No Wallet class match for baseChain=${baseChain}`);
  // return new WalletBase(options);
}

export default {
  getWalletInstance,
  createWallet,
};
