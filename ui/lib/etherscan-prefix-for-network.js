import {
  ROPSTEN_NETWORK_ID,
  RINKEBY_NETWORK_ID,
  KOVAN_NETWORK_ID,
  GOERLI_NETWORK_ID,
  BSC_TEST_NETWORK_ID,
  AVAX_NETWORK_ID,
  AVAX_BLOCK_EXPLORER_URL,
} from '../../shared/constants/network';

/**
 * Gets the etherscan.io URL prefix for a given network ID.
 *
 * @param {string} networkId - The network ID to get the prefix for.
 * @returns {string} The etherscan.io URL prefix for the given network ID.
 */
export function getEtherscanNetworkPrefix(networkId) {
  switch (networkId) {
    case ROPSTEN_NETWORK_ID:
      return 'ropsten.';
    case RINKEBY_NETWORK_ID:
      return 'rinkeby.';
    case KOVAN_NETWORK_ID:
      return 'kovan.';
    case GOERLI_NETWORK_ID:
      return 'goerli.';
    default:
      // also covers mainnet
      return '';
  }
}

export function getEtherscanNetwork(networkId, rpcPrefs = {}) {
  if (rpcPrefs.blockExplorerUrl) {
    return `${rpcPrefs.blockExplorerUrl.replace(/\/+$/u, '')}`;
  }

  switch (String(networkId)) {
    case AVAX_NETWORK_ID:
      return AVAX_BLOCK_EXPLORER_URL;
    default:
  }

  switch (Number(networkId)) {
    case 1: // main net
      return `https://etherscan.io`;
    case 2: // morden test net
      return `https://morden.etherscan.io`;
    case 3: // ropsten test net
      return `https://ropsten.etherscan.io`;
    case 4: // rinkeby test net
      return `https://rinkeby.etherscan.io`;
    case 42: // kovan test net
      return `https://kovan.etherscan.io`;
    case 5: // goerli test net
      return `https://goerli.etherscan.io`;
    case 128:
      return `https://hecoinfo.com`;
    case 56:
      return `https://bscscan.com`;
    case 137:
      return `https://polygonscan.com`;
    case 100:
      return `https://blockscout.com/xdai/mainnet`;
    case 250:
      return `https://ftmscan.com`;
    case 66:
      return `https://www.oklink.com/okexchain`;
    default:
      return 'https://etherscan.io';
  }
}
