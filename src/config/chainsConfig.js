import {
  CONST_BNB,
  CONST_BTC,
  CONST_CHAIN_KEYS,
  CONST_SOL,
} from '../consts/consts';

const SOL = {
  key: CONST_CHAIN_KEYS.SOL,
  name: 'Solana',
  baseChain: CONST_CHAIN_KEYS.SOL,
  currency: CONST_SOL,
  internalChainId: 101,
  rpc: ['https://solana-api.projectserum.com'],
  browser: ['https://solanascan.io/'],
  logo: 'images/chains/solana.svg',
  currencyIcon:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  isTestNet: false,
};
const SOL_TEST = {
  key: CONST_CHAIN_KEYS.SOL_TEST_NET,
  name: 'Solana 测试网',
  baseChain: CONST_CHAIN_KEYS.SOL,
  currency: CONST_SOL,
  internalChainId: 102,
  rpc: ['https://api.testnet.solana.com'],
  browser: ['https://solanascan.io/?testnet'],
  logo: 'images/chains/solana.svg',
  currencyIcon:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  isTestNet: true,
};
const BTC = {
  key: CONST_CHAIN_KEYS.BTC,
  name: 'BTC',
  baseChain: CONST_CHAIN_KEYS.BTC,
  currency: CONST_BTC,
  internalChainId: null,
  rpc: ['https://btc.com/'],
  browser: ['https://btc.com/'],
  isTestNet: false,
};
const BSC = {
  key: CONST_CHAIN_KEYS.BSC,
  name: 'BSC',
  baseChain: CONST_CHAIN_KEYS.ETH,
  currency: CONST_BNB,
  internalChainId: 56,
  rpc: [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
  ],
  browser: ['https://bscscan.com/'],
  isTestNet: false,
};
const BSC_TEST = {
  key: CONST_CHAIN_KEYS.BSC_TEST_NET,
  name: 'BSC Testnet',
  baseChain: CONST_CHAIN_KEYS.ETH,
  currency: CONST_BNB,
  internalChainId: 97,
  rpc: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  browser: ['https://testnet.bscscan.com/'],
  isTestNet: true,
};

export default {
  SOL,
  SOL_TEST,
  BTC,
  BSC,
  BSC_TEST,
};
