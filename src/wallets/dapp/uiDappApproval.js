import { BACKGROUND_PROXY_MODULE_NAMES } from '../../consts/consts';
import uiBackgroundProxy from '../bg/uiBackgroundProxy';

async function _bgProxyCall(method, params) {
  return await uiBackgroundProxy.baseProxyCall({
    module: BACKGROUND_PROXY_MODULE_NAMES.approve,
    method,
    params,
  });
}

async function _bgProxyCallApproval(query, { method, data }) {
  return _bgProxyCall(method, {
    key: query.approveKey,
    data,
  });
}

async function reject(query, error) {
  return _bgProxyCallApproval(query, {
    method: 'reject',
    data: error,
  });
}

async function resolve(query, data) {
  return _bgProxyCallApproval(query, {
    method: 'resolve',
    data,
  });
}

async function approveConnection(query, address) {
  return resolve(query, [].concat(address).filter(Boolean));
}

async function approveTransaction(query, txid) {
  return resolve(query, txid);
}

// uiDappApproval.js
// DappApprovalMethods.js
// storeDappApproval.js
// storeDappNotify.js
async function onUnlockedChanged(payload) {
  return _bgProxyCall('onUnlockedChanged', payload);
}

async function onAccountsChanged(payload) {
  return _bgProxyCall('onAccountsChanged', payload);
}

async function onChainChanged(payload) {
  return _bgProxyCall('onChainChanged', payload);
}

export default {
  approveTransaction,
  approveConnection,
  resolve,
  reject,
  onUnlockedChanged,
  onAccountsChanged,
  onChainChanged,
};
