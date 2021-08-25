import {
  AVAX_BLOCK_EXPLORER_URL,
  AVAX_CHAIN_ID,
  MAINNET_CHAIN_ID,
  MORDEN_CHAIN_ID,
  ROPSTEN_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  KOVAN_CHAIN_ID,
  GOERLI_CHAIN_ID,
  HECO_CHAIN_ID,
  BSC_CHAIN_ID,
  MATIC_CHAIN_ID,
  XDAI_CHAIN_ID,
  FANTOM_CHAIN_ID,
  OKEX_CHAIN_ID,
} from '../../shared/constants/network';
import {
  getChainIdFromNetworkId,
  removeUrlLastSlash,
} from '../../shared/modules/network.utils';

export function getEtherscanNetwork(chainId, rpcPrefs = {}, networkId = '') {
  // instead of @onekeyhq/etherscan-link
  if (rpcPrefs && rpcPrefs.blockExplorerUrl) {
    return removeUrlLastSlash(rpcPrefs.blockExplorerUrl);
  }

  const chainIdStr = getChainIdFromNetworkId({
    chainId,
    networkId,
  });

  switch (chainIdStr) {
    case AVAX_CHAIN_ID:
      return removeUrlLastSlash(AVAX_BLOCK_EXPLORER_URL);
    case MAINNET_CHAIN_ID: // main net
      return `https://etherscan.io`;
    case MORDEN_CHAIN_ID: // morden test net
      return `https://morden.etherscan.io`;
    case ROPSTEN_CHAIN_ID: // ropsten test net
      return `https://ropsten.etherscan.io`;
    case RINKEBY_CHAIN_ID: // rinkeby test net
      return `https://rinkeby.etherscan.io`;
    case KOVAN_CHAIN_ID: // kovan test net
      return `https://kovan.etherscan.io`;
    case GOERLI_CHAIN_ID: // goerli test net
      return `https://goerli.etherscan.io`;
    case HECO_CHAIN_ID:
      return `https://hecoinfo.com`;
    case BSC_CHAIN_ID:
      return `https://bscscan.com`;
    case MATIC_CHAIN_ID:
      return `https://polygonscan.com`;
    case XDAI_CHAIN_ID:
      return `https://blockscout.com/xdai/mainnet`;
    case FANTOM_CHAIN_ID:
      return `https://ftmscan.com`;
    case OKEX_CHAIN_ID:
      return `https://www.oklink.com/okexchain`;
    default:
      return 'https://etherscan.io';
  }
}
