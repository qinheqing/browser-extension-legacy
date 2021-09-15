import { shimWeb3, setGlobalProvider } from '@onekeyhq/providers';
import logger from 'src/log/logger';
import {
  METHOD_GET_PROVIDER_OVERWRITE_ENABLED,
  METHOD_SET_OTHER_PROVIDER_STATUS,
} from './constants/consts';

let switchProviderName = '';
function switchProvider(name) {
  switchProviderName = name;
}
let otherProvider = null;
let otherProviderInjectStep = ''; // first, last

function hasOtherProviderInjected() {
  return window.ethereum && !window.ethereum.isOneKey;
}

function saveOtherProvider() {
  if (hasOtherProviderInjected()) {
    otherProvider = window.ethereum;
    return true;
  }
  return false;
}

function setGlobalsVars({ provider, overwrite = true, triggerEvent = true }) {
  if (saveOtherProvider()) {
    otherProviderInjectStep = 'last';
  }

  if (otherProvider) {
    provider.request({
      method: METHOD_SET_OTHER_PROVIDER_STATUS,
      params: [
        {
          message: 'MetaMask provider inject first',
          inject: true,
          step: otherProviderInjectStep,
          overwrite,
        },
      ],
    });
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
        let _provider = window.onekey;
        // DAPP controlled provider > switchProviderName
        if (switchProviderName) {
          const name = (switchProviderName || '').toLowerCase();
          if (name === 'onekey') {
            _provider = window.onekey;
            _provider.isOneKey = true;
            _provider.isMetaMask = false;
          }

          if (name === 'metamask' && otherProvider) {
            _provider = otherProvider;
          }
        }
        // USER controlled provider > overwrite
        else if (!overwrite && otherProvider) {
          _provider = otherProvider;
        }

        _provider =
          _provider || otherProvider || window.onekey || window.ethereum;

        if (!_provider.switchProvider) {
          _provider.switchProvider = switchProvider;
        }
        return _provider;
      },
      set(val) {
        otherProvider = val;
        provider.request({
          method: METHOD_SET_OTHER_PROVIDER_STATUS,
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
    console.error(ex);
    // setGlobalProvider(provider);
    window.ethereum = provider;
  }

  setTimeout(() => {
    if (!otherProvider) {
      provider.request({
        method: METHOD_SET_OTHER_PROVIDER_STATUS,
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

  if (triggerEvent) {
    window.dispatchEvent(new Event('ethereum#initialized'));
    window.dispatchEvent(new Event('onekey#initialized'));
  }
}

function createProviderProxy({ provider }) {
  return new Proxy(provider, {
    deleteProperty: () => true,
  });
}

function initOneKeyVariable({ provider }) {
  window.onekey = createProviderProxy({ provider });
  window.onekey.__mockOtherProviderInject = () => {
    if (otherProvider) {
      window.ethereum = otherProvider;
      console.log('otherProvider set ', otherProvider);
    } else {
      console.log('no otherProvider found');
    }
  };
}

function initEthereumVariable({ provider }) {
  window.ethereum = createProviderProxy({ provider });
  shimWeb3(window.ethereum, logger);
}

function resolveConflict({ provider }) {
  if (saveOtherProvider()) {
    otherProviderInjectStep = 'first';
  }

  // set window.ethereum always first
  initEthereumVariable({ provider });

  initOneKeyVariable({ provider });

  provider
    .request({ method: METHOD_GET_PROVIDER_OVERWRITE_ENABLED, params: [] })
    .then((overwrite) => {
      setGlobalsVars({ provider, overwrite });
    });
}

export default {
  resolveConflict,
};
