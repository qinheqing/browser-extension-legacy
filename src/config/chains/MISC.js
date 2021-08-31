import { CONST_BNB, CONST_BTC, CONST_CHAIN_KEYS } from '../../consts/consts';
import { normalizeChainInfo } from '../../wallets/helpers/configHelpers';

const BTC = normalizeChainInfo({
  key: CONST_CHAIN_KEYS.BTC,
  name: 'BTC',
  baseChain: CONST_CHAIN_KEYS.BTC,
  currency: CONST_BTC,
  tokenChainId: null,
  rpc: ['https://btc.com/'],
  browser: ['https://btc.com/'],
  isTestNet: false,
});
const BSC = normalizeChainInfo({
  key: CONST_CHAIN_KEYS.BSC,
  name: 'BSC',
  baseChain: CONST_CHAIN_KEYS.ETH,
  currency: CONST_BNB,
  tokenChainId: 56,
  rpc: [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
  ],
  browser: ['https://bscscan.com/'],
  isTestNet: false,
});
const BSC_TEST = normalizeChainInfo({
  key: CONST_CHAIN_KEYS.BSC_TEST_NET,
  name: 'BSC Testnet',
  baseChain: CONST_CHAIN_KEYS.ETH,
  currency: CONST_BNB,
  tokenChainId: 97,
  rpc: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  browser: ['https://testnet.bscscan.com/'],
  isTestNet: true,
});

export { BTC, BSC, BSC_TEST };
