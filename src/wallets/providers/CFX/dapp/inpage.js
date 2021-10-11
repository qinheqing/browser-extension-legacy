import { shimWeb3, BaseProvider } from '@onekeyhq/providers';
import { JsonRpcEngine } from '@onekeyhq/json-rpc-engine';
import logger from '../../../../log/logger';
import { STREAM_PROVIDER_CFX } from '../../../../../app/scripts/constants/consts';
import { CONST_CHAIN_KEYS } from '../../../../consts/consts';

function createProviderProxy({ provider }) {
  return new Proxy(provider, {
    deleteProperty: () => true,
  });
}

function initConfluxVariable({ provider }) {
  window.conflux = createProviderProxy({ provider });
  window.conflux.isConfluxPortal = true;
  window.conflux.baseChain = CONST_CHAIN_KEYS.CFX;

  window.conflux._rpcRequestOld = window.conflux._rpcRequest;
  window.conflux._rpcRequest = function (payload, ...others) {
    const newPayload = {
      ...payload,
    };

    if (
      payload &&
      payload.method &&
      typeof payload.method === 'string' &&
      payload.method.startsWith('eth_')
    ) {
      newPayload.methodLegacy = newPayload.method;
      newPayload.method = newPayload.method.replace(/^eth_/giu, 'cfx_');
    }
    return this._rpcRequestOld(newPayload ?? payload, ...others);
  };

  shimWeb3(window.conflux, logger);
}

function init({ provider }) {
  if (provider) {
    initConfluxVariable({ provider });
  } else {
    console.error('Conflux provider is NOT exists');
  }
}

export default {
  init,
};
