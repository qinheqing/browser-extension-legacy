const evmChainsConfig = [
  { chain: 'mainnet', chainName: 'ETH', chainIcon: 'eth' },
  { chain: 'bsc', chainName: 'BSC' },
  { chain: 'heco', chainName: 'HECO' },
  { chain: 'okex', chainName: 'OKEX', chainIcon: 'okt' },
  { chain: 'matic', chainIcon: 'polygon' },
  { chain: 'fantom' },
  { chain: 'xdai', chainName: 'XDAI' },
  { chain: 'avalanche' },
  {
    chain: 'ropsten',
    isTestNet: true,
    chainIcon: 'eth',
  },
  { chain: 'kovan', isTestNet: true, chainIcon: 'eth' },
  {
    chain: 'rinkeby',
    isTestNet: true,
    chainIcon: 'eth',
  },
  {
    chain: 'bsc_test',
    chainName: 'BSC Test',
    isTestNet: true,
    chainIcon: 'bsc',
  },
];

export default evmChainsConfig;
