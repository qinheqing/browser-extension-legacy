import {
  AVAX_BLOCK_EXPLORER_URL,
  AVAX_NETWORK_ID,
  BSC_NETWORK_ID,
  BSC_TEST,
  BSC_TEST_NETWORK_ID,
  FANTOM_NETWORK_ID,
  GOERLI_NETWORK_ID,
  HECO_NETWORK_ID,
  KOVAN_NETWORK_ID,
  MAINNET_NETWORK_ID,
  MATIC_NETWORK_ID,
  MORDEN_NETWORK_ID,
  OKEX_NETWORK_ID,
  RINKEBY_NETWORK_ID,
  ROPSTEN_NETWORK_ID,
  XDAI_NETWORK_ID,
} from '../../shared/constants/network';

export default function getAccountLink(address, network, rpcPrefs) {
  if (rpcPrefs && rpcPrefs.blockExplorerUrl) {
    return `${rpcPrefs.blockExplorerUrl.replace(
      /\/+$/u,
      '',
    )}/address/${address}`;
  }

  // eslint-disable-next-line radix
  const net = String(network);
  switch (net) {
    case AVAX_NETWORK_ID: // main net
      return `${AVAX_BLOCK_EXPLORER_URL}/address/${address}`;
    case MAINNET_NETWORK_ID: // main net
      return `https://etherscan.io/address/${address}`;
    case MORDEN_NETWORK_ID: // morden test net
      return `https://morden.etherscan.io/address/${address}`;
    case ROPSTEN_NETWORK_ID: // ropsten test net
      return `https://ropsten.etherscan.io/address/${address}`;
    case RINKEBY_NETWORK_ID: // rinkeby test net
      return `https://rinkeby.etherscan.io/address/${address}`;
    case GOERLI_NETWORK_ID: // goerli test net
      return `https://goerli.etherscan.io/address/${address}`;
    case KOVAN_NETWORK_ID: // kovan test net
      return `https://kovan.etherscan.io/address/${address}`;
    case HECO_NETWORK_ID:
      return `https://hecoinfo.com/address/${address}`;
    case BSC_NETWORK_ID:
      return `https://bscscan.com/address/${address}`;
    case BSC_TEST_NETWORK_ID:
      return `https://testnet.bscscan.com/address/${address}`;
    case MATIC_NETWORK_ID:
      return `https://polygonscan.com/address/${address}`;
    case XDAI_NETWORK_ID:
      return `https://blockscout.com/xdai/mainnet/address/${address}`;
    case FANTOM_NETWORK_ID:
      return `https://ftmscan.com/address/${address}`;
    case OKEX_NETWORK_ID:
      return `https://www.oklink.com/okexchain/address/${address}`;
    default:
      return `https://etherscan.io/address/${address}`;
  }
}
