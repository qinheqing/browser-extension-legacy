import { strict as assert } from 'assert';
import txHelper from '../../../../../ui/lib/tx-helper';
import {
  MAINNET_CHAIN_ID,
  MAINNET_NETWORK_ID,
  ROPSTEN_CHAIN_ID,
} from '../../../../../shared/constants/network';

describe('txHelper', function () {
  it('always shows the oldest tx first', function () {
    const metamaskNetworkId = ROPSTEN_CHAIN_ID;
    const chainId = MAINNET_CHAIN_ID;
    const txs = {
      a: { metamaskNetworkId, chainId, time: 3 },
      b: { metamaskNetworkId, chainId, time: 1 },
      c: { metamaskNetworkId, chainId, time: 5 },
      d: { metamaskNetworkId, chainId, time: 9 },
      e: { metamaskNetworkId, chainId: 193, time: 2 },
    };

    const sorted = txHelper(
      txs,
      null,
      null,
      null,
      null,
      null,
      metamaskNetworkId,
      chainId,
    );
    assert.equal(sorted.length, 4);
    assert.equal(sorted[0].time, 1, 'oldest tx first');
    assert.equal(sorted[2].time, 5, 'newest tx last');
  });
});
