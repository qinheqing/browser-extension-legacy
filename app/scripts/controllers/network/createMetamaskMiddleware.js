import {
  createScaffoldMiddleware,
  mergeMiddleware,
} from '@onekeyhq/json-rpc-engine';
import createWalletSubprovider from 'eth-json-rpc-middleware/wallet';
import {
  createPendingNonceMiddleware,
  createPendingTxMiddleware,
} from './middleware/pending';

export default function createMetamaskMiddleware({
  version,
  getDeviceFeatures,
  getAccounts,
  processTransaction,
  processEthSignMessage,
  processTypedMessage,
  processTypedMessageV3,
  processTypedMessageV4,
  processPersonalMessage,
  processDecryptMessage,
  processEncryptionPublicKey,
  getPendingNonce,
  getPendingTransactionByHash,
}) {
  const metamaskMiddleware = mergeMiddleware([
    createScaffoldMiddleware({
      // staticSubprovider
      eth_syncing: false,
      web3_clientVersion: `MetaMask/v${version}`,
    }),
    createWalletSubprovider({
      getDeviceFeatures,
      getAccounts,
      processTransaction,
      processEthSignMessage,
      processTypedMessage,
      processTypedMessageV3,
      processTypedMessageV4,
      processPersonalMessage,
      processDecryptMessage,
      processEncryptionPublicKey,
    }),
    createPendingNonceMiddleware({ getPendingNonce }),
    createPendingTxMiddleware({ getPendingTransactionByHash }),
  ]);
  return metamaskMiddleware;
}
