import {
  AVAX_BLOCK_EXPLORER_URL,
  AVAX_CHAIN_ID,
  BSC_CHAIN_ID,
  BSC_TEST_CHAIN_ID,
  FANTOM_CHAIN_ID,
  GOERLI_CHAIN_ID,
  HECO_CHAIN_ID,
  KOVAN_CHAIN_ID,
  MAINNET_CHAIN_ID,
  MATIC_CHAIN_ID,
  MORDEN_CHAIN_ID,
  OKEX_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  ROPSTEN_CHAIN_ID,
  XDAI_CHAIN_ID,
} from '../../shared/constants/network';
import {
  getChainIdFromNetworkId,
  removeUrlLastSlash,
} from '../../shared/modules/network.utils';

export default function getAccountLink(
  address,
  chainId,
  rpcPrefs = {},
  networkId = '',
) {
  // instead of @onekeyhq/etherscan-link
  if (rpcPrefs && rpcPrefs.blockExplorerUrl) {
    return `${removeUrlLastSlash(
      rpcPrefs.blockExplorerUrl,
    )}/address/${address}`;
  }

  const chainIdStr = getChainIdFromNetworkId({
    chainId,
    networkId,
  });

  // eslint-disable-next-line radix
  switch (chainIdStr) {
    case AVAX_CHAIN_ID: // main net
      return `${removeUrlLastSlash(
        AVAX_BLOCK_EXPLORER_URL,
      )}/address/${address}`;
    case MAINNET_CHAIN_ID: // main net
      return `https://etherscan.io/address/${address}`;
    case MORDEN_CHAIN_ID: // morden test net
      return `https://morden.etherscan.io/address/${address}`;
    case ROPSTEN_CHAIN_ID: // ropsten test net
      return `https://ropsten.etherscan.io/address/${address}`;
    case RINKEBY_CHAIN_ID: // rinkeby test net
      return `https://rinkeby.etherscan.io/address/${address}`;
    case GOERLI_CHAIN_ID: // goerli test net
      return `https://goerli.etherscan.io/address/${address}`;
    case KOVAN_CHAIN_ID: // kovan test net
      return `https://kovan.etherscan.io/address/${address}`;
    case HECO_CHAIN_ID:
      return `https://hecoinfo.com/address/${address}`;
    case BSC_CHAIN_ID:
      return `https://bscscan.com/address/${address}`;
    case BSC_TEST_CHAIN_ID:
      return `https://testnet.bscscan.com/address/${address}`;
    case MATIC_CHAIN_ID:
      return `https://polygonscan.com/address/${address}`;
    case XDAI_CHAIN_ID:
      return `https://blockscout.com/xdai/mainnet/address/${address}`;
    case FANTOM_CHAIN_ID:
      return `https://ftmscan.com/address/${address}`;
    case OKEX_CHAIN_ID:
      return `https://www.oklink.com/okexchain/address/${address}`;
    default:
      return `https://etherscan.io/address/${address}`;
  }
}
