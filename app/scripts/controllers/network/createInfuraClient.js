import {
  createScaffoldMiddleware,
  mergeMiddleware,
} from '@onekeyhq/json-rpc-engine';
import createBlockReRefMiddleware from 'eth-json-rpc-middleware/block-ref';
import createRetryOnEmptyMiddleware from 'eth-json-rpc-middleware/retryOnEmpty';
import createBlockCacheMiddleware from 'eth-json-rpc-middleware/block-cache';
import createInflightMiddleware from 'eth-json-rpc-middleware/inflight-cache';
import createBlockTrackerInspectorMiddleware from 'eth-json-rpc-middleware/block-tracker-inspector';
import providerFromMiddleware from 'eth-json-rpc-middleware/providerFromMiddleware';
import createInfuraMiddleware from 'eth-json-rpc-infura';
import BlockTracker from 'eth-block-tracker';

import {
  NETWORK_TYPE_TO_ID_MAP,
  NETWORK_FALLBACK_URL,
  MAINNET,
  ETH_RPC_URL,
} from '../../../../shared/constants/network';

import { createFetchMiddleware } from './libs/fetch';

export default function createInfuraClient({ network, projectId }) {
  const rpcUrl =
    NETWORK_TYPE_TO_ID_MAP[network] && NETWORK_TYPE_TO_ID_MAP[network].rpcUrl;
  const fallbackUrls = NETWORK_FALLBACK_URL[network];
  const infuraMiddleware = rpcUrl
    ? createFetchMiddleware({
        rpcUrl,
        originHttpHeaderKey: undefined,
        fallbackUrls,
      })
    : createInfuraMiddleware({
        network,
        projectId,
        maxAttempts: 5,
        source: 'metamask',
      });
  const infuraProvider = providerFromMiddleware(infuraMiddleware);
  const blockTracker = new BlockTracker({ provider: infuraProvider });

  const networkMiddleware = mergeMiddleware([
    createNetworkAndChainIdMiddleware({ network }),
    createBlockCacheMiddleware({ blockTracker }),
    createInflightMiddleware(),
    createBlockReRefMiddleware({ blockTracker, provider: infuraProvider }),
    createRetryOnEmptyMiddleware({ blockTracker, provider: infuraProvider }),
    createBlockTrackerInspectorMiddleware({ blockTracker }),
    infuraMiddleware,
  ]);
  return { networkMiddleware, blockTracker };
}

function createNetworkAndChainIdMiddleware({ network }) {
  if (!NETWORK_TYPE_TO_ID_MAP[network]) {
    throw new Error(`createInfuraClient - unknown network "${network}"`);
  }

  const { chainId, networkId } = NETWORK_TYPE_TO_ID_MAP[network];

  return createScaffoldMiddleware({
    eth_chainId: chainId,
    net_version: networkId,
  });
}
