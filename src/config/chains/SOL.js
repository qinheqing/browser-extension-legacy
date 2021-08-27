import { merge } from 'lodash';
import { CONST_CHAIN_KEYS } from '../../consts/consts';
import { normalizeChainInfo } from './configHelpers';

const SOL = normalizeChainInfo({
  key: CONST_CHAIN_KEYS.SOL,
  baseChain: CONST_CHAIN_KEYS.SOL,

  name: 'Solana',
  shortname: 'Solana',
  chainLogo: 'images/chains/solana.svg',
  isTestNet: false,
  tokenAddMode: 'soft', // soft, hard
  hdPathTemplate: `m/44'/501'/{{index}}'/0'`,

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
  platformId: 'solana', // "id" in coingecko /api/v3/asset_platforms
  tokenChainId: '', // autoset = nativeToken.chainId
  currency: '', // autoset = nativeToken.symbol
  currencyLogo: '', // autoset = nativeToken.logoURI

  // https://api.coingecko.com/api/v3/coins/list
  // copy from token-list.json
  nativeToken: {
    // = extensions?.coingeckoId
    tokenId: 'solana', // "id" in coingecko /api/v3/coins/list
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    precision: 8, // UI display precision
    // 101 MainNet, 102 TestNet, 103 DevNet, used for search tokens from token-list.json
    chainId: 101, // "chain_identifier" in coingecko /api/v3/asset_platforms
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    address: '', // token contract address
  },
});

const SOL_TEST = normalizeChainInfo(
  merge({}, SOL, {
    key: CONST_CHAIN_KEYS.SOL_TEST_NET,
    name: 'Solana 测试网',
    shortname: 'SolanaT',
    isTestNet: true,
    nativeToken: {
      // 101 MainNet, 102 TestNet, 103 DevNet, used for search tokens
      chainId: 102,
    },
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
        token:
          'https://explorer.solana.com/address/{{account}}?cluster=testnet',
        block: 'https://explorer.solana.com/block/{{block}}?cluster=testnet',
      },
      {
        home: 'https://explorer.solana.com?cluster=devnet',
        tx: 'https://explorer.solana.com/tx/{{tx}}?cluster=devnet',
        account:
          'https://explorer.solana.com/address/{{account}}?cluster=devnet',
        token: 'https://explorer.solana.com/address/{{account}}?cluster=devnet',
        block: 'https://explorer.solana.com/block/{{block}}?cluster=devnet',
      },
    ],
  }),
);

export { SOL, SOL_TEST };
