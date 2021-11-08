import utilsStorage from '../../src/utils/utilsStorage';

function buildCustomRpcUrlStorageKey(providerType) {
  return `${utilsStorage.KEYS.BUILT_IN_NETWORK_CUSTOM_RPC_URL}/${providerType}`;
}

const rpcDefaults = {
  // providerType: rpcUrl
};

function getRpcUrlAndSaveDefault(providerType, defaultRpcUrl) {
  return getRpcUrl(providerType, defaultRpcUrl, true);
}

function getRpcUrl(providerType, defaultRpcUrl = '', saveDefault = false) {
  if (saveDefault && defaultRpcUrl) {
    rpcDefaults[providerType] = defaultRpcUrl;
  }

  if (!providerType) {
    return defaultRpcUrl;
  }
  const key = buildCustomRpcUrlStorageKey(providerType);
  const rpcUrl = utilsStorage.getItem(key) || defaultRpcUrl;
  return rpcUrl;
}

function getDefaultRpcUrl(providerType) {
  if (!providerType) {
    return '';
  }
  return rpcDefaults[providerType] || '';
}

export default getRpcUrl;
export {
  buildCustomRpcUrlStorageKey,
  getDefaultRpcUrl,
  getRpcUrlAndSaveDefault,
};
