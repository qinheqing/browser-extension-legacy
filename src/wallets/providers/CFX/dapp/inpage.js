import {
  shimWeb3,
  BaseProvider,
  setGlobalProvider as setGlobalProviderOld,
} from '@onekeyhq/providers';
import { JsonRpcEngine } from '@onekeyhq/json-rpc-engine';
import logger from '../../../../log/logger';
import { CONST_CHAIN_KEYS } from '../../../../consts/consts';

function createProviderProxy({ provider }) {
  return new Proxy(provider, {
    deleteProperty: () => true,
  });
}

function setGlobalProvider({ provider }) {
  window.conflux = createProviderProxy({ provider });
  window.conflux.isConfluxPortal = true;
  window.conflux.baseChain = CONST_CHAIN_KEYS.CFX;

  // confluxscan.io use off() instead of removeListener(), so we should create it.
  window.conflux.off = (...args) => {
    console.warn(`OneKey: 'conflux.off()' is deprecated and may be removed in the future. Please use the 'conflux.removeListener()' instead.
`);
    window.conflux.removeListener(...args);
  };

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
      newPayload.methodOriginal = newPayload.method;
      newPayload.method = newPayload.method.replace(/^eth_/giu, 'cfx_');
    }
    return this._rpcRequestOld(newPayload ?? payload, ...others);
  };

  shimWeb3(window.conflux, logger);

  // TODO dispatchEvent after all providers ready
  window.dispatchEvent(new Event('ethereum#initialized'));
  window.dispatchEvent(new Event('conflux#initialized'));
}

function init({ provider }) {
  if (provider) {
    setGlobalProvider({ provider });
  } else {
    console.error('Conflux provider is NOT exists');
  }
}

export default {
  init,
};
