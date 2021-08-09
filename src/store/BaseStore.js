/* eslint import/no-cycle: "error" */
import assert from 'assert';
import { autorun, makeObservable, toJS, configure } from 'mobx';
import { isFunction, isNil } from 'lodash';
import utilsApp from '../utils/utilsApp';

configure({
  // https://mobx.js.org/configuration.html#enforceactions
  enforceActions: 'never',
});
global.__mobxToJS = toJS;

class BaseStore {
  constructor(props) {
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    assert(
      utilsApp.isUiEnvironment(),
      'Mobx Store is not allowed in extension background runtime',
    );
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
