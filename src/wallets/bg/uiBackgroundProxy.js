import { BACKGROUND_PROXY_MODULE_NAMES } from '../../consts/consts';
import uiGetBgControllerAsync from './uiGetBgControllerAsync';

// TODO change to global singleton
class UiBackgroundProxy {
  async baseProxyCall({ module, options = {}, method, params = {} }) {
    console.log('OneKeyBackgroundProxy call: ', module, method, params);
    const bg = await uiGetBgControllerAsync();
    const response = await bg.backgroundProxyCall({
      module,
      options,
      method,
      params,
    });
    console.log('OneKeyBackgroundProxy response: ', {
      module,
      options,
      method,
      params,
      _response: response,
    });
    return response;
  }

  // ----------------------------------------------

  // ----------------------------------------------

  async hardwareProxyCall({ method, params }) {
    return this.baseProxyCall({
      module: BACKGROUND_PROXY_MODULE_NAMES.hardware,
      options: {},
      method,
      params,
    });
  }

  hardwareGetAddressETH(params) {
    return this.hardwareProxyCall({ method: 'ethereumGetAddress', params });
  }

  hardwareGetAddressSOL(params) {
    return this.hardwareProxyCall({ method: 'stellarGetAddress', params });
  }

  hardwareGetAddress(params) {
    return this.hardwareProxyCall({ method: 'getAddress', params });
  }

  hardwareGetPublicKey(params) {
    return this.hardwareProxyCall({ method: 'getPublicKey', params });
  }
}

const uiBackgroundProxy = new UiBackgroundProxy();
global.$$uiBackgroundProxy = uiBackgroundProxy;
export default uiBackgroundProxy;
export { UiBackgroundProxy };
