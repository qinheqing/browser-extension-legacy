import { merge } from 'lodash';
import configsHelper from '../../../helpers/configsHelper';
import {
  CONST_CFX,
  CONST_CHAIN_KEYS,
  CONST_ADD_TOKEN_MODE,
} from '../../../../consts/consts';

const CFX = configsHelper.normalizeChainInfo({
  key: CONST_CHAIN_KEYS.CFX,
  baseChain: CONST_CHAIN_KEYS.CFX,

  name: 'Conflux 主网',
  shortname: 'Conflux',
  chainLogo: 'images/chains/conflux.svg',
  isTestNet: false,
  addTokenMode: CONST_ADD_TOKEN_MODE.LOCAL,
  hdPathTemplate: `m/44'/503'/0'/0/{{index}}`,
  colorBg: '#3a5a6a',

  rpc: ['https://main.confluxrpc.com'],
  browser: [
    {
      home: 'https://confluxscan.io',
      tx: 'https://confluxscan.io/transaction/{{tx}}',
      account: 'https://confluxscan.io/address/{{account}}',
      token: 'https://confluxscan.io/address/{{token}}',
      block: 'https://confluxscan.io/block/{{block}}',
      api: 'https://api.confluxscan.net',
    },
  ],

  // https://api.coingecko.com/api/v3/asset_platforms
  platformId: '', // "id" in coingecko /api/v3/asset_platforms
  tokenChainId: '', // autoset = nativeToken.chainId
  currency: '', // autoset = nativeToken.symbol
  currencyLogo: '', // autoset = nativeToken.logoURI

  // https://api.coingecko.com/api/v3/coins/list
  // copy from token-list.json
  nativeToken: {
    // = extensions?.coingeckoId
    tokenId: 'conflux-token', // "id" in coingecko /api/v3/coins/list
    name: 'Conflux', // "name" in coingecko /api/v3/coins/list
    symbol: CONST_CFX,
    unitName: 'drip',
    decimals: 18,
    precision: 8, // UI display precision
    // mainnet: 1029, testnet: 1 ;    used for search tokens from token-list.json
    chainId: 1029, // "chain_identifier" in coingecko /api/v3/asset_platforms
    logoURI: 'images/chains/conflux.svg',
    address: '', // token contract address
  },
});

// http://faucet.confluxnetwork.org/
const CFX_TEST = configsHelper.normalizeChainInfo(
  merge({}, CFX, {
    key: CONST_CHAIN_KEYS.CFX_TEST,
    name: 'Conflux 测试网',
    shortname: 'ConfluxT',
    isTestNet: true,
    nativeToken: {
      // mainnet: 1029, testnet: 1 ;    used for search tokens from token-list.json
      chainId: 1,
    },
    rpc: ['https://test.confluxrpc.com'],
    browser: [
      {
        home: 'https://testnet.confluxscan.io',
        tx: 'https://testnet.confluxscan.io/transaction/{{tx}}',
        account: 'https://testnet.confluxscan.io/address/{{account}}',
        token: 'https://testnet.confluxscan.io/address/{{token}}',
        block: 'https://testnet.confluxscan.io/block/{{block}}',
        api: 'https://api-testnet.confluxscan.net',
      },
    ],
  }),
);

export { CFX, CFX_TEST };
