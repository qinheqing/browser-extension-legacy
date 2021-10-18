// run in ui
import { BACKGROUND_PROXY_MODULE_NAMES } from '../consts/consts';
import { UiBackgroundProxy } from './bg/uiBackgroundProxy';

class KeyringUiToBgProxy extends UiBackgroundProxy {
  constructor(options) {
    super(options);
    this.options = options;
  }

  async keyringProxyCall({ method, params }) {
    return this.baseProxyCall({
      module: BACKGROUND_PROXY_MODULE_NAMES.keyring,
      options: this.options,
      method,
      params,
    });
  }

  async getAddresses({ indexes = [0], ...others }) {
    return this.keyringProxyCall({
      method: 'getAddresses',
      params: { indexes, ...others },
    });
  }

  async signTransaction({ tx, hdPath, ...others }) {
    return this.keyringProxyCall({
      method: 'signTransaction',
      params: {
        tx,
        hdPath,
        ...others,
      },
    });
  }

  async getAccountPrivateKey({ path, ...others }) {
    return this.keyringProxyCall({
      method: 'getAccountPrivateKey',
      params: { path, ...others },
    });
  }
}

export default KeyringUiToBgProxy;
