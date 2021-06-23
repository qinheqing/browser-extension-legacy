const KEYS = {};

// TODO add dev、test、prd flag
const STORAGE_KEY_PREFIX = 'onekey/';

function buildFullKey(key) {
  return STORAGE_KEY_PREFIX + key;
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

export default {
  KEYS,
  setItem,
  getItem,
  removeItem,
  clear,
};
