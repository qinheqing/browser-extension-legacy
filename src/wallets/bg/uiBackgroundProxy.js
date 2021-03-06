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
}

const uiBackgroundProxy = new UiBackgroundProxy();
global.$ok_uiBackgroundProxy = uiBackgroundProxy;
export default uiBackgroundProxy;
export { UiBackgroundProxy };
