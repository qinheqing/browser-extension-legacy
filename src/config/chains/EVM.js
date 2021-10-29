const evmChainsConfig = [
  { chain: 'mainnet', chainName: 'ETH' },
  { chain: 'bsc', chainName: 'BSC' },
  { chain: 'heco', chainName: 'HECO' },
  { chain: 'okex', chainName: 'OKEX' },
  { chain: 'matic' },
  { chain: 'fantom' },
  { chain: 'xdai', chainName: 'XDAI' },
  { chain: 'avalanche' },
  {
    chain: 'ropsten',
    isTestNet: true,
  },
  { chain: 'kovan', isTestNet: true },
  {
    chain: 'rinkeby',
    isTestNet: true,
  },
];

export default evmChainsConfig;
