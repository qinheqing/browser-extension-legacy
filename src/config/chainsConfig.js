import {
  CONST_BNB,
  CONST_BTC,
  CONST_CHAIN_KEYS,
  CONST_SOL,
} from '../consts/consts';

const SOL = {
  // hdCoin: 'solana',
  key: CONST_CHAIN_KEYS.SOL,

  baseChain: CONST_CHAIN_KEYS.SOL,
  currency: CONST_SOL, // TODO return this.nativeToken.symbol

  rpc: [
    'https://api.mainnet-beta.solana.com',
    // 'https://solana-api.projectserum.com'
  ],
  browser: [
    {
      home: 'https://explorer.solana.com',
      tx: 'https://explorer.solana.com/tx/{{tx}}',
      account: 'https://explorer.solana.com/address/{{account}}',
      token: 'https://explorer.solana.com/address/{{account}}',
      block: 'https://explorer.solana.com/block/{{block}}',
    },
  ],

  // https://api.coingecko.com/api/v3/asset_platforms
  platformId: 'solana',
  name: 'Solana',
  shortname: 'Solana',
  // TODO rename to "logoURI"
  logo: 'images/chains/solana.svg', // chain logo,
  // TODO rename to tokenChainId, "chain_identifier" in coingecko asset_platforms api
  internalChainId: 101, // 101 MainNet, 102 TestNet, 103 DevNet, used for search tokens

  // https://api.coingecko.com/api/v3/coins/list
  //    TODO replace "currency"
  nativeToken: {
    tokenId: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    chainId: null,
    logoURI: '', // TODO replace root."currencyIcon"
    address: '', // token contract address
    decimals: 18,
    precision: 8, // UI display precision
  },
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
  // internalChainId: 103,
  rpc: [
    'https://api.testnet.solana.com',
    // 'https://api.devnet.solana.com',
  ],
  browser: [
    {
      home: 'https://explorer.solana.com?cluster=testnet',
      tx: 'https://explorer.solana.com/tx/{{tx}}?cluster=testnet',
      account:
        'https://explorer.solana.com/address/{{account}}?cluster=testnet',
      token: 'https://explorer.solana.com/address/{{account}}?cluster=testnet',
      block: 'https://explorer.solana.com/block/{{block}}?cluster=testnet',
    },
    {
      home: 'https://explorer.solana.com?cluster=devnet',
      tx: 'https://explorer.solana.com/tx/{{tx}}?cluster=devnet',
      account: 'https://explorer.solana.com/address/{{account}}?cluster=devnet',
      token: 'https://explorer.solana.com/address/{{account}}?cluster=devnet',
      block: 'https://explorer.solana.com/block/{{block}}?cluster=devnet',
    },
  ],
  platformId: 'solana',
  nativeToken: {
    tokenId: 'solana',
  },
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
