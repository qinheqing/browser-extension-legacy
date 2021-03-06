import assert from 'assert';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_GROUP_STATUSES,
  TRANSACTION_STATUSES,
} from '../../../../shared/constants/transaction';
import {
  MAINNET_CHAIN_ID,
  ROPSTEN_CHAIN_ID,
} from '../../../../shared/constants/network';
import * as utils from './transactions.util';

describe('Transactions utils', function () {
  describe('getTokenData', function () {
    it('should return token data', function () {
      const tokenData = utils.getTokenData(
        '0xa9059cbb00000000000000000000000050a9d56c2b8ba9a5c7f2c08c3d26e0499f23a7060000000000000000000000000000000000000000000000000000000000004e20',
      );
      assert.ok(tokenData);
      const { name, args } = tokenData;
      assert.strictEqual(name, TRANSACTION_CATEGORIES.TOKEN_METHOD_TRANSFER);
      const to = args._to;
      const value = args._value.toString();
      assert.strictEqual(to, '0x50A9D56C2B8BA9A5c7f2C08C3d26E0499F23a706');
      assert.strictEqual(value, '20000');
    });

    it('should not throw errors when called without arguments', function () {
      assert.doesNotThrow(() => utils.getTokenData());
    });
  });

  describe('getStatusKey', function () {
    it('should return the correct status', function () {
      const tests = [
        {
          transaction: {
            status: TRANSACTION_STATUSES.CONFIRMED,
            txReceipt: {
              status: '0x0',
            },
          },
          expected: TRANSACTION_STATUSES.FAILED,
        },
        {
          transaction: {
            status: TRANSACTION_STATUSES.CONFIRMED,
            txReceipt: {
              status: '0x1',
            },
          },
          expected: TRANSACTION_STATUSES.CONFIRMED,
        },
        {
          transaction: {
            status: TRANSACTION_GROUP_STATUSES.PENDING,
          },
          expected: TRANSACTION_GROUP_STATUSES.PENDING,
        },
      ];

      tests.forEach(({ transaction, expected }) => {
        assert.strictEqual(utils.getStatusKey(transaction), expected);
      });
    });
  });

  describe('getBlockExplorerUrlForTx', function () {
    it('should return the correct block explorer url for a transaction', function () {
      const tests = [
        {
          expected: 'https://etherscan.io/tx/0xabcd',
          networkId: '1',
          chainId: MAINNET_CHAIN_ID,
          hash: '0xabcd',
        },
        {
          expected: 'https://ropsten.etherscan.io/tx/0xdef0',
          networkId: '3',
          chainId: ROPSTEN_CHAIN_ID,
          hash: '0xdef0',
          rpcPrefs: {},
        },
        {
          // test handling of `blockExplorerUrl` for a custom RPC
          expected: 'https://block.explorer/tx/0xabcd',
          networkId: '31',
          chainId: ROPSTEN_CHAIN_ID,
          hash: '0xabcd',
          rpcPrefs: {
            blockExplorerUrl: 'https://block.explorer',
          },
        },
        {
          // test handling of trailing `/` in `blockExplorerUrl` for a custom RPC
          expected: 'https://another.block.explorer/tx/0xdef0',
          networkId: '33',
          chainId: ROPSTEN_CHAIN_ID,
          hash: '0xdef0',
          rpcPrefs: {
            blockExplorerUrl: 'https://another.block.explorer/',
          },
        },
      ];

      tests.forEach(({ expected, chainId, networkId, hash, rpcPrefs }) => {
        assert.strictEqual(
          utils.getBlockExplorerUrlForTx(
            {
              chainId,
              networkId,
              hash,
            },
            rpcPrefs,
          ),
          expected,
        );
      });
    });
  });
});
