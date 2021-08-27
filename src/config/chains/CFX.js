import { merge } from 'lodash';
import { CONST_CFX, CONST_CHAIN_KEYS, CONST_SOL } from '../../consts/consts';
import { normalizeChainInfo } from './configHelpers';

const CFX = normalizeChainInfo({
  key: CONST_CHAIN_KEYS.CFX,
  baseChain: CONST_CHAIN_KEYS.CFX,

  name: 'Conflux',
  shortname: 'Conflux',
  chainLogo: 'images/chains/conflux.svg',
  isTestNet: false,
  tokenAddMode: 'soft', // soft, hard
  hdPathTemplate: `m/44'/503'/0'/0/{{index}}`,

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

export { CFX };
