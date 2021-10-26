/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
  toJS,
} from 'mobx';
import { isNil } from 'lodash';
import utilsStorage from '../utils/utilsStorage';
import ExtensionStore from '../../app/scripts/lib/local-store';
import BaseStore from './BaseStore';

// true: localStorage
// false: extensionStorage
const USE_LOCAL_STORAGE = false;

const extStorage = new ExtensionStore();

class BaseStoreWithStorage extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  storageNamespace = '';

  async getStorageItemAsync(key, { useLocalStorage = USE_LOCAL_STORAGE } = {}) {
    if (useLocalStorage) {
      return utilsStorage.getItem(key);
    }
    return (await extStorage.get([key]))?.[key];
  }

  async setStorageItemAsync(
    key,
    value,
    { useLocalStorage = USE_LOCAL_STORAGE } = {},
  ) {
    // TODO move save storage to background, so that we can disable auto save globally
    if (useLocalStorage) {
      utilsStorage.setItem(key, value);
    }
    return extStorage.set({
      [key]: value,
    });
  }

  createAutoSaveAutoRunHook({ store, storeProp, storageKey, useLocalStorage }) {
    autorun(() => {
      const watchValue = store[storeProp];
      // keep this outside untracked(), otherwise deep object will not trigger autorun
      const plainValue = toJS(watchValue);

      untracked(() => {
        if (storeProp === 'allAccountsRaw') {
          // debugger;
        }
        // TODO requestAnimationFrame + throttle optimize
        this.setStorageItemAsync(storageKey, plainValue, { useLocalStorage });
      });
    });
  }

  // TODO make autosave to decorator
  // TODO data migrate implement
  async autosave(
    storeProp,
    { useLocalStorage = USE_LOCAL_STORAGE, defaultValue } = {},
  ) {
    if (!this.storageNamespace) {
      throw new Error(
        'Please init this.storageNamespace at BaseStoreWithStorage Sub-Class',
      );
    }
    // eslint-disable-next-line consistent-this
    const store = this;
    const storageKey = utilsStorage.buildAutoSaveStorageKey(
      storeProp,
      this.storageNamespace,
    );

    // * init from localStorage
    let value = await this.getStorageItemAsync(storageKey, {
      useLocalStorage,
    });
    value = value ?? defaultValue;

    // load storage data async delay simulate
    // await utilsApp.delay(5000);

    if (storeProp === 'allAccountsRaw') {
      // debugger;
    }

    if (!isNil(value)) {
      store[storeProp] = value;
    }

    // * watch value change, auto save to localStorage
    this.createAutoSaveAutoRunHook({
      store,
      storeProp,
      storageKey,
      useLocalStorage,
    });
  }
}

export default BaseStoreWithStorage;
