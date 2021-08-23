import addEthereumChain from './add-ethereum-chain';
import getProviderState from './get-provider-state';
import logWeb3ShimUsage from './log-web3-shim-usage';
import watchAsset from './watch-asset';
import {
  getProviderOverwriteEnabled,
  getOtherProviderStatus,
} from './providerOverwrite';

const handlers = [
  addEthereumChain,
  getProviderState,
  logWeb3ShimUsage,
  watchAsset,
  getProviderOverwriteEnabled,
  getOtherProviderStatus,
];
export default handlers;
