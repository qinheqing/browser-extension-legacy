import { BACKGROUND_PROXY_MODULE_NAMES } from '../../consts/consts';
import uiBackgroundProxy from '../bg/uiBackgroundProxy';

async function bgProxyCall(query, { method, data }) {
  await uiBackgroundProxy.baseProxyCall({
    module: BACKGROUND_PROXY_MODULE_NAMES.approve,
    method,
    params: {
      key: query.approveKey,
      data,
    },
  });
}

async function reject(query, error) {
  return bgProxyCall(query, {
    method: 'reject',
    data: error,
  });
}

async function resolve(query, data) {
  return bgProxyCall(query, {
    method: 'resolve',
    data,
  });
}

async function approveConnection(query, address) {
  return resolve(query, [].concat(address).filter(Boolean));
}

export default {
  approveConnection,
  resolve,
  reject,
};
