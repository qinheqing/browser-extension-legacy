import { BACKGROUND_PROXY_MODULE_NAMES } from '../../consts/consts';
import keyringFactory from '../keyringFactory';
import DappApprovalMethods from '../dapp/DappApprovalMethods';

// TODO error handle, pass error from bg to ui, user can see it

class BackgroundMiscMethods {
  throwErrorTest({ name }) {
    console.log(global[`helloWorld1887-${name}`][`showMeTheMoney-${name}`]());
  }
}
const backgroundMiscMethods = new BackgroundMiscMethods();

const dappApprovalMethods = new DappApprovalMethods();

// DO NOT call this method from ui process, it can ONLY work from bg process
// TODO add some auto check if calling from ui process, and throw errors
function callMethod({ module, options, method, params }) {
  if (module === BACKGROUND_PROXY_MODULE_NAMES.keyring) {
    const keyring = keyringFactory.createKeyring(options);
    return keyring[method](params);
  }

  if (module === BACKGROUND_PROXY_MODULE_NAMES.misc) {
    return backgroundMiscMethods[method](params);
  }

  if (module === BACKGROUND_PROXY_MODULE_NAMES.approve) {
    return dappApprovalMethods[method](params);
  }
  throw new Error(`${module}/${method} backgroundProxy method not exists`);
}

export default {
  callMethod,
  dappApprovalMethods,
};
