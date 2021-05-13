export default function getAccountLink(address, network, rpcPrefs) {
  if (rpcPrefs && rpcPrefs.blockExplorerUrl) {
    return `${rpcPrefs.blockExplorerUrl.replace(
      /\/+$/u,
      '',
    )}/address/${address}`;
  }

  // eslint-disable-next-line radix
  const net = parseInt(network);
  switch (net) {
    case 1: // main net
      return `https://etherscan.io/address/${address}`;
    case 2: // morden test net
      return `https://morden.etherscan.io/address/${address}`;
    case 3: // ropsten test net
      return `https://ropsten.etherscan.io/address/${address}`;
    case 4: // rinkeby test net
      return `https://rinkeby.etherscan.io/address/${address}`;
    case 42: // kovan test net
      return `https://kovan.etherscan.io/address/${address}`;
    case 5: // goerli test net
      return `https://goerli.etherscan.io/address/${address}`;
    case 128:
      return `https://hecoinfo.com/address/${address}`;
    case 56:
      return `https://bscscan.com/address/${address}`;
    case 137:
      return `https://explorer-mainnet.maticvigil.com/address/${address}`;
    case 100:
      return `https://blockscout.com/xdai/mainnet/address/${address}`;
    case 250:
      return `https://ftmscan.com/address/${address}`;
    case 66:
      return `https://www.oklink.com/okexchain/address/${address}`;
    default:
      return `https://etherscan.io/address/${address}`;
  }
}
