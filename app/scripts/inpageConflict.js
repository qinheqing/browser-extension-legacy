import { shimWeb3, setGlobalProvider } from '@onekeyhq/providers';
import logger from 'src/log/logger';
import {
  METHOD_PROVIDER_OVERWRITE_ENABLED,
  METHOD_OTHER_PROVIDER_STATUS,
} from './constants/consts';

let switchProviderName = '';
function switchProvider(name) {
  switchProviderName = name;
}

function setGlobalsVars({ provider, overwrite = true }) {
  const onekeyProvider = new Proxy(provider, {
    deleteProperty: () => true,
  });
  let otherProvider = null;

  window.onekey = onekeyProvider;
  window.onekey.__mockOtherProviderInject = () => {
    otherProvider && (window.ethereum = otherProvider);
  };

  if (window.ethereum) {
    provider.request({
      method: METHOD_OTHER_PROVIDER_STATUS,
      params: [
        {
          message: 'MetaMask provider inject first',
          inject: true,
          step: 'first',
          overwrite,
        },
      ],
    });
    otherProvider = window.ethereum;
  }

  /*
  let canDefineProperty = true;
  const propDesc = Object.getOwnPropertyDescriptor(window, 'ethereum');
  if (propDesc && !propDesc.value) {
    canDefineProperty = false;
  }
  */

  try {
    Object.defineProperty(window, 'ethereum', {
      get() {
        let _provider = onekeyProvider;
        if (switchProviderName) {
          const name = (switchProviderName || '').toLowerCase();
          if (name === 'onekey') {
            _provider = onekeyProvider;
            _provider.isOneKey = true;
            _provider.isMetaMask = false;
          }

          if (name === 'metamask' && otherProvider) {
            _provider = otherProvider;
          }
        } else if (otherProvider && !overwrite) {
          _provider = otherProvider;
        }

        if (!_provider.switchProvider) {
          _provider.switchProvider = switchProvider;
        }
        return _provider;
      },
      set(val) {
        otherProvider = val;
        provider.request({
          method: METHOD_OTHER_PROVIDER_STATUS,
          params: [
            {
              message: 'MetaMask provider inject last',
              inject: true,
              step: 'last',
              overwrite,
            },
          ],
        });
      },
    });
  } catch (ex) {
    // setGlobalProvider(provider);
    window.ethereum = provider;
  }

  setTimeout(() => {
    if (!otherProvider) {
      provider.request({
        method: METHOD_OTHER_PROVIDER_STATUS,
        params: [
          {
            message: 'MetaMask provider NOT inject',
            inject: false,
            step: '',
            overwrite,
          },
        ],
      });
    }
  }, 5000);

  shimWeb3(window.ethereum, logger);

  window.dispatchEvent(new Event('ethereum#initialized'));
  window.dispatchEvent(new Event('onekey#initialized'));
}

function resolveConflict({ provider }) {
  provider
    .request({ method: METHOD_PROVIDER_OVERWRITE_ENABLED, params: [] })
    .then((overwrite) => {
      setGlobalsVars({ provider, overwrite });
    });
}

export default {
  resolveConflict,
};
