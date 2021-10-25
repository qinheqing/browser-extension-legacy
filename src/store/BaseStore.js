/* eslint import/no-cycle: "error" */
import assert from 'assert';
import { autorun, makeObservable, toJS, configure, untracked } from 'mobx';
import { isFunction, isNil } from 'lodash';
import utilsApp from '../utils/utilsApp';

configure({
  // https://mobx.js.org/configuration.html#enforceactions
  enforceActions: 'never',
});
global.$ok_mobxToJS = toJS;

class BaseStore {
  constructor(props = {}) {
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    if (props?.shouldRunInBackground) {
      if (utilsApp.isUiEnvironment()) {
        throw new Error(
          `[${this.constructor.name}] Mobx Store is not allowed in extension <ui> runtime`,
        );
      }
    } else if (utilsApp.isBackgroundEnvironment()) {
      throw new Error(
        `[${this.constructor.name}] Mobx Store is not allowed in extension <background> runtime`,
      );
    }
  }

  /*
    // useAutorun(storeBrowse.autoRunSearch);

    autoRunSearch = this.makeAutoRun(
      // callback
      () => {
        if (utilsApp.isBrowserSide()) {
          void this.searchDebounce(this.query);
        }
      },
      // deps getter
      () => {
        const { query } = this;
        const { q, chainId, sort } = query;
      },
    );
   */
  makeAutoRun(callback, deps) {
    return () => {
      const dispose = autorun(() => {
        // TODO add built-in deps
        //  storeStorage.storageReady
        //  storeApp.metamaskStateReady
        //  storeApp.isInitialized
        deps();
        untracked(() => {
          callback();
        });
      });
      return dispose;
    };
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
