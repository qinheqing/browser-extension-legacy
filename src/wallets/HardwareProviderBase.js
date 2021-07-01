// DO NOT add this module to package.json, as two diffent version of connect (keyring) will break
// eslint-disable-next-line node/no-extraneous-import, import/no-extraneous-dependencies
import OneKeyConnect from '@onekeyhq/connect';
import { toLower } from 'lodash';
import utilsApp from '../utils/utilsApp';
import { UiBackgroundProxy } from './bg/UiBackgroundProxy';

class HardwareProviderBase {
  // Why use proxy, not use connect directly:
  //     old ui and new ui should call connect at the same bg process,
  //     otherwise the second ui connect hardware will not work
  bgProxy = new UiBackgroundProxy();

  _connectInternal = OneKeyConnect; // DO NOT use this, use OneKeyBackgroundProxy to invoke connect functions

  isCoinMatch(coin1 = '', coin2 = '') {
    return toLower(coin1) === toLower(coin2);
  }

  // TODO batch get
  async getPublicKey({ coin, path }) {
    return this.bgProxy.hardwareGetPublicKey({
      path,
      coin,
    });
  }

  /**
   *
   * @param coin
   * @param bundle  [ { coin, path } ]
   * @return {*}
   */
  async getAddress({ coin, bundle }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async signTransaction({ tx, hdPath }) {
    return utilsApp.throwToBeImplemented(this);
  }
}

export default HardwareProviderBase;
