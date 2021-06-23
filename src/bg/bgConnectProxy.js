// DO NOT add this module to package.json, as two diffent version of connect (keyring) will break
// eslint-disable-next-line node/no-extraneous-import, import/no-extraneous-dependencies
import OneKeyConnect from '@onekeyhq/connect';

OneKeyConnect.manifest({
  email: 'hi@onekey.so',
  appUrl: 'https://www.onekey.so',
});
// TODO error handle, pass error from bg to ui, user can see it

// DO NOT call this method from ui process, it can ONLY work from bg process
// TODO add some auto check if calling from ui process, and throw errors
function callMethod(method, params) {
  return OneKeyConnect[method](params);
}

export default {
  callMethod,
};
