// DO NOT add this module to package.json, as two diffent version of connect (keyring) will break
// eslint-disable-next-line node/no-extraneous-import, import/no-extraneous-dependencies
import OneKeyConnect from '@onekeyhq/connect';
import { toLower } from 'lodash';
import utilsApp from '../utils/utilsApp';
import { getBackgroundInstance } from '../../ui/app/store/actions';

// Why use proxy, not use connect directly:
//     old ui and new ui should call connect at the same bg process,
//     otherwise the second ui connect hardware will not work
class OneKeyConnectProxy {
  async bgProxyCall(method, params) {
    console.log('OnekeyConnect hardware call: ', method, params);
    const bg = await getBackgroundInstance();
    const response = await bg.connectProxyCall(method, params);
    console.log('OnekeyConnect hardware response: ', {
      method,
      params,
      response,
    });
    return response;
  }

  // TODO use Proxy to auto bind
  ethereumGetAddress(params) {
    return this.bgProxyCall('ethereumGetAddress', params);
  }

  stellarGetAddress(params) {
    return this.bgProxyCall('stellarGetAddress', params);
  }

  getAddress(params) {
    return this.bgProxyCall('getAddress', params);
  }

  getPublicKey(params) {
    return this.bgProxyCall('getPublicKey', params);
  }
}

class HardwareProviderBase {
  constructor(props) {
    this.connect = new OneKeyConnectProxy();
  }

  connect = OneKeyConnect;

  isCoinMatch(coin1 = '', coin2 = '') {
    return toLower(coin1) === toLower(coin2);
  }

  // TODO batch get
  async getPublicKey({ coin, path }) {
    return this.connect.getPublicKey({
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
}

export default HardwareProviderBase;
