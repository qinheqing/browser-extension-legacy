import assert from 'assert';
import getAccountLink from '../../../ui/lib/account-link';
import {
  GOERLI_CHAIN_ID,
  KOVAN_CHAIN_ID,
  MAINNET_CHAIN_ID,
  ROPSTEN_CHAIN_ID,
} from '../../../shared/constants/network';

describe('Account link', function () {
  describe('getAccountLink', function () {
    it('should return the correct block explorer url for an account', function () {
      const tests = [
        {
          expected: 'https://etherscan.io/address/0xabcd',
          network: 1,
          chainId: MAINNET_CHAIN_ID,
          address: '0xabcd',
        },
        {
          expected: 'https://ropsten.etherscan.io/address/0xdef0',
          network: 3,
          chainId: ROPSTEN_CHAIN_ID,
          address: '0xdef0',
          rpcPrefs: {},
        },
        {
          // test handling of `blockExplorerUrl` for a custom RPC
          expected: 'https://block.explorer/address/0xabcd',
          network: 31,
          chainId: KOVAN_CHAIN_ID,
          address: '0xabcd',
          rpcPrefs: {
            blockExplorerUrl: 'https://block.explorer',
          },
        },
        {
          // test handling of trailing `/` in `blockExplorerUrl` for a custom RPC
          expected: 'https://another.block.explorer/address/0xdef0',
          network: 33,
          chainId: GOERLI_CHAIN_ID,
          address: '0xdef0',
          rpcPrefs: {
            blockExplorerUrl: 'https://another.block.explorer/',
          },
        },
      ];

      tests.forEach(({ expected, address, network, chainId, rpcPrefs }) => {
        assert.equal(
          getAccountLink(address, chainId, rpcPrefs, network),
          expected,
        );
      });
    });
  });
});
