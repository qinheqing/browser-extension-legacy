import addEthereumChain from './add-ethereum-chain';
import getProviderState from './get-provider-state';
import logWeb3ShimUsage from './log-web3-shim-usage';
import watchAsset from './watch-asset';
import providerOverwriteHandlers from './providerOverwrite';
import getDeviceFeatures from './getDeviceFeatures';

const handlers = [
  addEthereumChain,
  getProviderState,
  logWeb3ShimUsage,
  watchAsset,
  getDeviceFeatures,
  ...providerOverwriteHandlers,
];
export default handlers;
