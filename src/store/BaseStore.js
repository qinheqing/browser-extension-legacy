/* eslint import/no-cycle: "error" */
import { autorun, makeObservable, toJS, configure } from 'mobx';
import { isFunction, isNil } from 'lodash';
import utilsStorage from '../utils/utilsStorage';

configure({
  // https://mobx.js.org/configuration.html#enforceactions
  enforceActions: 'never',
});
global.__mobxToJS = toJS;

export function getAutoSaveLocalStorageItem(name) {
  const storageKey = buildAutoSaveStorageKey(name);
  return utilsStorage.getItem(storageKey);
}

export function buildAutoSaveStorageKey(name) {
  return `autosave.storage.${name}`;
}

class BaseStore {
  constructor(props) {
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  toJS() {
    const keys = Object.getOwnPropertyNames(this);
    const json = {};
    keys.forEach((k) => {
      const v = this[k];
      const jsv = toJS(v);
      if (!isFunction(jsv)) {
        json[k] = jsv;
      }
    });
    return json;
  }
}

export default BaseStore;
