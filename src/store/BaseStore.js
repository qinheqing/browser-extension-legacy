import { autorun, makeObservable, toJS } from 'mobx';
import { isFunction, isNil } from 'lodash';
import utilsStorage from '../utils/utilsStorage';

class BaseStore {
  constructor(props) {
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  // TODO move to extension local store, and save to single place
  autosave(storeProp) {
    // eslint-disable-next-line consistent-this
    const store = this;
    // TODO  this will have some problem, when code change, save key will change
    const storageKey = `mobx:${store.constructor.name}.${storeProp}`;

    // * init from localStorage
    const value = utilsStorage.getItem(storageKey);
    if (!isNil(value)) {
      store[storeProp] = value;
    }

    // * watch value change, auto save to localStorage
    autorun(() => {
      const watchValue = store[storeProp];
      // TODO requestAnimationFrame + throttle optimize
      utilsStorage.setItem(storageKey, watchValue);
    });
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
