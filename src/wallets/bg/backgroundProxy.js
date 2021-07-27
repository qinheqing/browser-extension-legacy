// DO NOT add this module "@onekeyhq/connect" to package.json, as two diffent version of connect (keyring) will break
// eslint-disable-next-line node/no-extraneous-import, import/no-extraneous-dependencies
import OneKeyConnect from '@onekeyhq/connect';
import { BACKGROUND_PROXY_MODULE_NAMES } from '../../consts/consts';
import keyringFactory from '../keyringFactory';

OneKeyConnect.manifest({
  email: 'hi@onekey.so',
  appUrl: 'https://www.onekey.so',
});
// TODO error handle, pass error from bg to ui, user can see it

class BackgroundMiscMethods {
  throwErrorTest({ name }) {
    console.log(global[`helloWorld1887-${name}`][`showMeTheMoney-${name}`]());
  }
}
const backgroundMiscMethods = new BackgroundMiscMethods();

// DO NOT call this method from ui process, it can ONLY work from bg process
// TODO add some auto check if calling from ui process, and throw errors
function callMethod({ module, options, method, params }) {
  if (module === BACKGROUND_PROXY_MODULE_NAMES.hardware) {
    return OneKeyConnect[method](params);
  }
  if (module === BACKGROUND_PROXY_MODULE_NAMES.keyring) {
    const keyring = keyringFactory.createKeyring(options);
    return keyring[method](params);
  }
  if (module === BACKGROUND_PROXY_MODULE_NAMES.misc) {
    return backgroundMiscMethods[method](params);
  }
  throw new Error(`${module}/${method} backgroundProxy method not exists`);
}

export default {
  callMethod,
};
