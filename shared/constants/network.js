export const ROPSTEN = 'ropsten';
export const RINKEBY = 'rinkeby';
export const KOVAN = 'kovan';
export const MAINNET = 'mainnet';
export const GOERLI = 'goerli';
export const HECO = 'heco';
export const BSC = 'bsc';
export const MATIC = 'matic';
export const XDAI = "xdai";
export const FANTOM = "fantom";
export const NETWORK_TYPE_RPC = 'rpc';

export const MAINNET_NETWORK_ID = '1';
export const ROPSTEN_NETWORK_ID = '3';
export const RINKEBY_NETWORK_ID = '4';
export const GOERLI_NETWORK_ID = '5';
export const KOVAN_NETWORK_ID = '42';
export const HECO_NETWORK_ID = '128';
export const BSC_NETWORK_ID = '56';
export const XDAI_NETWORK_ID = '100';
export const MATIC_NETWORK_ID = '137';
export const FANTOM_NETWORK_ID = '250'

export const MAINNET_CHAIN_ID = '0x1';
export const ROPSTEN_CHAIN_ID = '0x3';
export const RINKEBY_CHAIN_ID = '0x4';
export const GOERLI_CHAIN_ID = '0x5';
export const KOVAN_CHAIN_ID = '0x2a';
export const HECO_CHAIN_ID = '0x80';
export const BSC_CHAIN_ID = '0x38';
export const XDAI_CHAIN_ID = "0x64";
export const MATIC_CHAIN_ID = '0x89';
export const FANTOM_CHAIN_ID = '0xfa';

/**
 * The largest possible chain ID we can handle.
 * Explanation: https://gist.github.com/rekmarks/a47bd5f2525936c4b8eee31a16345553
 */
export const MAX_SAFE_CHAIN_ID = 4503599627370476;

export const ROPSTEN_DISPLAY_NAME = 'Ropsten';
export const RINKEBY_DISPLAY_NAME = 'Rinkeby';
export const KOVAN_DISPLAY_NAME = 'Kovan';
export const MAINNET_DISPLAY_NAME = 'Ethereum Mainnet';
export const GOERLI_DISPLAY_NAME = 'Goerli';
export const HECO_DISPLAY_NAME = 'Heco Mainnet';
export const BSC_DISPLAY_NAME = 'Bsc Mainnet';
export const XDAI_DISPLAY_NAME = 'xDai Mainnet';
export const MATIC_DISPLAY_NAME = 'Polygon Mainnet';
export const FANTOM_DISPLAY_NAME = 'Fantom Opera';


export const INFURA_PROVIDER_TYPES = [ROPSTEN, RINKEBY, KOVAN, MAINNET, GOERLI];
export const BUILDINT_PROVIDER_TYPES = [HECO, BSC, MATIC, XDAI, FANTOM]
export const SECURE_NETWORKS = [].concat(INFURA_PROVIDER_TYPES).concat(BUILDINT_PROVIDER_TYPES)

export const ETH_RPC_URL = "https://rpc.blkdb.cn/eth"

export const HECO_RPC_URL = "https://rpc.blkdb.cn/heco";
export const HECO_TICKER = "HT";
export const HECO_IMAGE = "./images/ht_logo.svg";

export const BSC_RPC_URL = "https://rpc.blkdb.cn/bsc";
export const BSC_TICKER = "BNB";
export const BSC_IMAGE = "./images/bsc_logo.svg";

export const MATIC_RPC_URL = "https://rpc-mainnet.matic.network";
export const MATIC_TICKER = 'MATIC';
export const MATIC_IMAGE = './images/matic_logo.svg';

export const XDAI_RPC_URL = "https://rpc.xdaichain.com";
export const XDAI_TICKER = 'xDai';
export const XDAI_IMAGE = './images/xdai_logo.svg';

export const FANTOM_RPC_URL = "https://rpcapi.fantom.network";
export const FANTOM_TICKER = 'FTM';
export const FANTOM_IMAGE = './images/fantom_logo.svg';

export const NETWORK_TYPE_TO_TICKER_MAP = {
  [HECO]: HECO_TICKER,
  [BSC]: BSC_TICKER,
  [MATIC]: MATIC_TICKER,
  [FANTOM]: FANTOM_TICKER
}

export const TEST_CHAINS = [
  ROPSTEN_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  GOERLI_CHAIN_ID,
  KOVAN_CHAIN_ID,
];


export const NETWORK_FALLBACK_URL = {
  [MAINNET]: [
    "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    "https://mainnet.infura.io/v3/0f1946aacbeb4f98a83cc1058764dbc1",
  ],
  [BSC]: [
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
    "https://bsc-dataseed2.defibit.io",
    "https://bsc-dataseed3.defibit.io"
  ],
  [HECO]: [
    "https://http-mainnet-node.huobichain.com",
    "https://http-mainnet-node.defibox.com",
    "https://http-mainnet.hecochain.com"
  ]
}

export const NETWORK_TYPE_TO_ID_MAP = {
  [FANTOM]: { networkId: FANTOM_NETWORK_ID, chainId: FANTOM_CHAIN_ID, ticker: FANTOM_TICKER, rpcUrl: FANTOM_RPC_URL, image: FANTOM_IMAGE },
  [XDAI]: { networkId: XDAI_NETWORK_ID, chainId: XDAI_CHAIN_ID, ticker: XDAI_TICKER, rpcUrl: XDAI_RPC_URL, image: XDAI_IMAGE },
  [MATIC]: { networkId: MATIC_NETWORK_ID, chainId: MATIC_CHAIN_ID, ticker: MATIC_TICKER, rpcUrl: MATIC_RPC_URL, image: MATIC_IMAGE },
  [HECO]: { networkId: HECO_NETWORK_ID, chainId: HECO_CHAIN_ID, ticker: HECO_TICKER, rpcUrl: HECO_RPC_URL, image: HECO_IMAGE },
  [BSC]: { networkId: BSC_NETWORK_ID, chainId: BSC_CHAIN_ID, ticker: BSC_TICKER, rpcUrl: BSC_RPC_URL, image: BSC_IMAGE },
  [ROPSTEN]: { networkId: ROPSTEN_NETWORK_ID, chainId: ROPSTEN_CHAIN_ID },
  [RINKEBY]: { networkId: RINKEBY_NETWORK_ID, chainId: RINKEBY_CHAIN_ID },
  [KOVAN]: { networkId: KOVAN_NETWORK_ID, chainId: KOVAN_CHAIN_ID },
  [GOERLI]: { networkId: GOERLI_NETWORK_ID, chainId: GOERLI_CHAIN_ID },
  [MAINNET]: { networkId: MAINNET_NETWORK_ID, chainId: MAINNET_CHAIN_ID, rpcUrl: ETH_RPC_URL },
};

export const NETWORK_TO_NAME_MAP = {
  [ROPSTEN]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY]: RINKEBY_DISPLAY_NAME,
  [KOVAN]: KOVAN_DISPLAY_NAME,
  [MAINNET]: MAINNET_DISPLAY_NAME,
  [GOERLI]: GOERLI_DISPLAY_NAME,
  [HECO]: HECO_DISPLAY_NAME,
  [BSC]: BSC_DISPLAY_NAME,
  [MATIC]: MATIC_DISPLAY_NAME,
  [XDAI]: XDAI_DISPLAY_NAME,
  [FANTOM]: FANTOM_DISPLAY_NAME,

  [ROPSTEN_NETWORK_ID]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY_NETWORK_ID]: RINKEBY_DISPLAY_NAME,
  [KOVAN_NETWORK_ID]: KOVAN_DISPLAY_NAME,
  [GOERLI_NETWORK_ID]: GOERLI_DISPLAY_NAME,
  [MAINNET_NETWORK_ID]: MAINNET_DISPLAY_NAME,
  [HECO_NETWORK_ID]: HECO_DISPLAY_NAME,
  [BSC_NETWORK_ID]: BSC_DISPLAY_NAME,
  [MATIC_NETWORK_ID]: MATIC_DISPLAY_NAME,
  [XDAI_NETWORK_ID]: XDAI_DISPLAY_NAME,
  [FANTOM_NETWORK_ID]: FANTOM_DISPLAY_NAME,

  [ROPSTEN_CHAIN_ID]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY_CHAIN_ID]: RINKEBY_DISPLAY_NAME,
  [KOVAN_CHAIN_ID]: KOVAN_DISPLAY_NAME,
  [GOERLI_CHAIN_ID]: GOERLI_DISPLAY_NAME,
  [MAINNET_CHAIN_ID]: MAINNET_DISPLAY_NAME,
  [HECO_CHAIN_ID]: HECO_DISPLAY_NAME,
  [BSC_CHAIN_ID]: BSC_DISPLAY_NAME,
  [MATIC_CHAIN_ID]: MATIC_DISPLAY_NAME,
  [XDAI_CHAIN_ID]: XDAI_DISPLAY_NAME,
  [FANTOM_CHAIN_ID]: FANTOM_DISPLAY_NAME,
};

export const CHAIN_ID_TO_TYPE_MAP = Object.entries(
  NETWORK_TYPE_TO_ID_MAP,
).reduce((chainIdToTypeMap, [networkType, { chainId }]) => {
  chainIdToTypeMap[chainId] = networkType;
  return chainIdToTypeMap;
}, {});

export const CHAIN_ID_TO_NETWORK_ID_MAP = Object.values(
  NETWORK_TYPE_TO_ID_MAP,
).reduce((chainIdToNetworkIdMap, { chainId, networkId }) => {
  chainIdToNetworkIdMap[chainId] = networkId;
  return chainIdToNetworkIdMap;
}, {});
