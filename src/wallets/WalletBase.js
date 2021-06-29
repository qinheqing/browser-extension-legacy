import HDKey from 'hdkey';
import { toLower } from 'lodash';
import { CONST_HARDWARE_MODELS } from '../consts/consts';
import utilsApp from '../utils/utilsApp';
import ChainProviderBase from './ChainProviderBase';
import HardwareProviderBase from './HardwareProviderBase';
import { HdKeyProviderBase } from './HdKeyProvider';
import { UiBackgroundProxy } from './bg/UiBackgroundProxy';
import KeyringBase from './KeyringBase';

class WalletBase {
  constructor(options = {}) {
    const {
      // TODO chainInfo, accountInfo
      hardwareModel = CONST_HARDWARE_MODELS.Unknown,
      hdPath,
      accountInfo,
      chainInfo,
      ...others
    } = options;
    // TODO merge to options, remove
    this.hardwareModel = hardwareModel;
    this.hdPathCustomTemplate = hdPath;
    this.accountInfo = accountInfo;
    this.chainInfo = chainInfo;
    this.options = {
      ...this.optionsDefault,
      ...options,
    };
  }

  get optionsDefault() {
    return {};
  }

  options = {};

  // TODO remove
  hdPathCustomTemplate = '';

  hardwareModel = CONST_HARDWARE_MODELS.Unknown;

  hardwareProvider = new HardwareProviderBase(this.options); // OneKeyConnect

  chainProvider = new ChainProviderBase(this.options);

  hdkeyProvider = new HdKeyProviderBase(this.options);

  keyring = new KeyringBase(this.options);

  bgProxy = new UiBackgroundProxy();

  // TODO rename to hdkeyProvider
  hdkey = null; // new HDKey()

  // TODO rename to accountInfo.baseChain
  get hdCoin() {
    return utilsApp.throwToBeImplemented(this);
  }

  get hdCoinLowerCase() {
    return toLower(this.hdCoin);
  }

  // ----------------------------------------------

  keyringProxyCall({ method, params }) {
    return this.bgProxy.keyringProxyCall({
      options: { ...this.options, isAtBackground: true },
      method,
      params,
    });
  }

  /**
   *
   * @param index
   * @return
       "hardwareModel": "onekey",
       "hdCoin": "ETH",
       "hdPathIndex": 0,
       "hdPathTemplate": "m/44'/60'/0'/0/{{index}}",
       "hdPath": "m/44'/60'/0'/0/0",
   */
  buildAddressMeta({ index, hdPath, ...others }) {
    return this.keyring.buildAddressMeta({ index, hdPath, ...others });
  }

  async getAddresses({ indexes = [0] }) {
    const bundle = indexes.map((index) => ({
      path: this.hdkeyProvider.createHdPath({ index }),
      showOnTrezor: false,
    }));
    const params = {
      coin: this.hdCoinLowerCase,
      bundle,
    };
    const { id, success, payload } = await this.hardwareProvider.getAddress(
      params,
    );
    console.log({
      req: {
        params,
      },
      res: {
        id,
        success,
        payload,
      },
    });
    if (success) {
      return payload.map((data, i) => {
        /*
          "path": [1,2,3,4,5]
          "serializedPath": "m/44'/60'/0'/0/0",
          "address": "0x99F825D80cADd21D77D13B7e13D25960B40a6299",
         */
        const { serializedPath, address } = data;
        return {
          address,
          ...this.buildAddressMeta({
            index: indexes[i],
            hdPath: serializedPath,
          }),
        };
      });
    }
    return [];
  }

  addAssociateToken({ account, contract }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async transfer({ account, to, amount, decimals }) {
    return utilsApp.throwToBeImplemented(this);
  }

  async getLatestNonce() {
    return utilsApp.throwToBeImplemented(this);
  }

  // get fee from gasnow
  async fetchGasFee() {
    return utilsApp.throwToBeImplemented(this);
  }

  // TODO validate tx address and hdPath
  async signTx() {
    return utilsApp.throwToBeImplemented(this);
  }

  async signMultipleTx() {
    return utilsApp.throwToBeImplemented(this);
  }

  isValidAddress(address) {
    return utilsApp.throwToBeImplemented(this);
  }

  connectDapp(url) {
    return utilsApp.throwToBeImplemented(this);
  }
}

export default WalletBase;
