import ExtensionStore from '../../app/scripts/lib/local-store';

const KEYS = {
  BUILT_IN_NETWORK_CUSTOM_RPC_URL: 'BUILT_IN_NETWORK_CUSTOM_RPC_URL',
};

const extStorage = new ExtensionStore();

// TODO add dev、test、prd flag
const STORAGE_KEY_PREFIX = 'onekey/';

const STORAGE_NAMESPACES = {
  storage: 'storage',
  dappApproval: 'dappApproval',
  transfer: 'transfer',
};

function buildFullKey(key) {
  return STORAGE_KEY_PREFIX + key;
}

function getAutoSaveLocalStorageItem(name, ns) {
  const storageKey = buildAutoSaveStorageKey(name, ns);
  return getItem(storageKey);
}

function buildAutoSaveStorageKey(name, ns = STORAGE_NAMESPACES.storage) {
  return `autosave.${ns}.${name}`;
}

function setItem(key, value) {
  // TODO use chrome extension local store
  global.localStorage.setItem(buildFullKey(key), JSON.stringify(value));
}

function getItem(key) {
  const value = global.localStorage.getItem(buildFullKey(key));
  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
}

function removeItem(key) {
  global.localStorage.removeItem(buildFullKey(key));
}

function clear() {
  global.localStorage.clear();
}

async function getAutoSaveStorageItemAsync({
  key,
  field,
  namespace = STORAGE_NAMESPACES.storage,
  useLocalStorage = false,
} = {}) {
  const storageKey = key || buildAutoSaveStorageKey(field, namespace);

  if (useLocalStorage) {
    return getItem(storageKey);
  }
  return (await extStorage.get([storageKey]))?.[storageKey];
}

export default {
  STORAGE_NAMESPACES,
  KEYS,
  setItem,
  getItem,
  removeItem,
  clear,
  getAutoSaveLocalStorageItem, // localStorage only
  getAutoSaveStorageItemAsync, // localStorage + ExtensionStorage
  buildAutoSaveStorageKey,
};
