import {
  GOERLI,
  GOERLI_CHAIN_ID,
  KOVAN,
  KOVAN_CHAIN_ID,
  MAINNET,
  MAINNET_CHAIN_ID,
  ETH_RPC_URL,
  RINKEBY,
  RINKEBY_CHAIN_ID,
  ROPSTEN,
  ROPSTEN_CHAIN_ID,
  HECO,
  HECO_CHAIN_ID,
  BSC,
  BSC_CHAIN_ID,
  BSC_RPC_URL,
  BSC_TICKER,
  HECO_RPC_URL,
  HECO_TICKER,
  MATIC,
  MATIC_CHAIN_ID,
  MATIC_RPC_URL,
  MATIC_TICKER,
  XDAI,
  XDAI_CHAIN_ID,
  XDAI_RPC_URL,
  XDAI_TICKER,
  FANTOM,
  FANTOM_CHAIN_ID,
  FANTOM_RPC_URL,
  FANTOM_TICKER,
  OKEX,
  OKEX_CHAIN_ID,
  OKEX_RPC_URL,
  OKEX_TICKER,
  AVAX,
  AVAX_COLOR,
  AVAX_BLOCK_EXPLORER_URL,
  AVAX_RPC_URL,
  AVAX_CHAIN_ID,
  AVAX_TICKER,
} from '../../../../../shared/constants/network';

const defaultNetworksData = [
  {
    labelKey: MAINNET,
    iconColor: '#29B6AF',
    providerType: MAINNET,
    rpcUrl: ETH_RPC_URL,
    chainId: MAINNET_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://etherscan.io',
  },
  {
    labelKey: BSC,
    iconColor: '#ffd33d',
    providerType: BSC,
    rpcUrl: BSC_RPC_URL,
    chainId: BSC_CHAIN_ID,
    ticker: BSC_TICKER,
    blockExplorerUrl: 'https://bscscan.com',
  },
  {
    labelKey: HECO,
    iconColor: '#037dd6',
    providerType: HECO,
    rpcUrl: HECO_RPC_URL,
    chainId: HECO_CHAIN_ID,
    ticker: HECO_TICKER,
    blockExplorerUrl: 'https://hecoinfo.com',
  },
  {
    labelKey: OKEX,
    iconColor: '#1969ff',
    providerType: OKEX,
    rpcUrl: OKEX_RPC_URL,
    chainId: OKEX_CHAIN_ID,
    ticker: OKEX_TICKER,
    blockExplorerUrl: 'https://www.oklink.com/okexchain',
  },
  {
    labelKey: MATIC,
    iconColor: '#4cd964',
    providerType: MATIC,
    rpcUrl: MATIC_RPC_URL,
    chainId: MATIC_CHAIN_ID,
    ticker: MATIC_TICKER,
    blockExplorerUrl: 'https://polygonscan.com',
  },
  {
    labelKey: FANTOM,
    iconColor: '#1969ff',
    providerType: FANTOM,
    rpcUrl: FANTOM_RPC_URL,
    chainId: FANTOM_CHAIN_ID,
    ticker: FANTOM_TICKER,
    blockExplorerUrl: 'https://ftmscan.com',
  },
  {
    labelKey: XDAI,
    iconColor: '#48A9A6',
    providerType: XDAI,
    rpcUrl: XDAI_RPC_URL,
    chainId: XDAI_CHAIN_ID,
    ticker: XDAI_TICKER,
    blockExplorerUrl: 'https://blockscout.com/xdai/mainnet​',
  },
  {
    labelKey: AVAX,
    providerType: AVAX,
    iconColor: AVAX_COLOR,
    rpcUrl: AVAX_RPC_URL,
    chainId: AVAX_CHAIN_ID,
    ticker: AVAX_TICKER,
    blockExplorerUrl: AVAX_BLOCK_EXPLORER_URL,
  },
  {
    labelKey: ROPSTEN,
    iconColor: '#FF4A8D',
    providerType: ROPSTEN,
    rpcUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: ROPSTEN_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://ropsten.etherscan.io',
  },
  {
    labelKey: KOVAN,
    iconColor: '#9064FF',
    providerType: KOVAN,
    rpcUrl: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: KOVAN_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://kovan.etherscan.io',
  },
  {
    labelKey: RINKEBY,
    iconColor: '#F6C343',
    providerType: RINKEBY,
    rpcUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: RINKEBY_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://rinkeby.etherscan.io',
  },
];

export { defaultNetworksData };
