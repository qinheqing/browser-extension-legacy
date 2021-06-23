import HDKey from 'hdkey';
import { toLower } from 'lodash';
import { CONST_HARDWARE_MODELS } from '../consts/consts';
import utilsApp from '../utils/utilsApp';
import ChainProviderBase from './ChainProviderBase';
import HardwareProviderBase from './HardwareProviderBase';
import { HdKeyProviderBase } from './HdKeyProvider';

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
    // TODO merge to options
    this.hardwareModel = hardwareModel;
    this.hdPathCustomTemplate = hdPath;
    this.accountInfo = accountInfo;
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

  // TODO rename to hdkeyProvider
  hdkey = null; // new HDKey()

  // TODO rename to baseChain
  get hdCoin() {
    return utilsApp.throwToBeImplemented(this);
  }

  get hdCoinLowerCase() {
    return toLower(this.hdCoin);
  }

  // TODO remove, use getAddresses directly
  publicKeyToAddress({ publicKey }) {
    return utilsApp.throwToBeImplemented(this);
  }

  // TODO remove
  get hdPathUnlockTest() {
    return "m/44'/60'/0'/0/0";
  }

  // ----------------------------------------------

  // TODO remove
  async unlockHardware() {
    if (this.hdkey && this.hdkey.hdPath === this.hdPathUnlockTest) {
      return true;
    }

    const connectPayload = {
      coin: this.hdCoinLowerCase,
      path: this.hdPathUnlockTest,
    };
    console.log('connect.getPublicKey', connectPayload);
    try {
      const { id, success, payload } = await this.hardwareProvider.getPublicKey(
        connectPayload,
      );
      if (success) {
        const { publicKey, chainCode } = payload;
        this.hdkey = new HDKey();
        this.hdkey.hdPath = this.hdPathUnlockTest;
        this.hdkey.publicKey = Buffer.from(publicKey, 'hex');
        this.hdkey.chainCode = Buffer.from(chainCode, 'hex');
        // TODO remove
        this.$publicKey = publicKey;
        this.$chainCode = chainCode;
        console.log('OneKey Hardware getPublicKey', {
          pathTemplate: this.hdPathTemplate,
          parentPublicKey: publicKey,
        });
        return true;
      }
      console.error(
        `[Connect.error] connect.getPublicKey ${payload.code}: ${payload.error}`,
        connectPayload,
      );
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
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
  buildAddressMeta({ index }) {
    return {
      hardwareModel: this.hardwareModel,
      hdCoin: this.hdCoin,
      hdPathIndex: index,
      hdPathTemplate: this.hdkeyProvider.hdPathTemplate,
      hdPath: this.hdkeyProvider.createHdPath({ index }),
      hdPathUnlockTest: this.hdPathUnlockTest, // TODO remove
    };
  }

  getAddress({ index = 0 }) {
    const hkey = this.deriveHdKey({ index });
    const publicKeyBytes = hkey.publicKey;
    const publicKey = publicKeyBytes.toString('hex');
    const address = this.publicKeyToAddress({
      publicKeyBytes,
      publicKey,
    });
    console.log(this.buildAddressMeta({ index }));
    return {
      address,
      ...this.buildAddressMeta({ index }),
    };
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
        return {
          /*
            "path": [1,2,3,4,5]
            "serializedPath": "m/44'/60'/0'/0/0",
            "address": "0x99F825D80cADd21D77D13B7e13D25960B40a6299",
           */
          ...data,
          ...this.buildAddressMeta({ index: indexes[i] }),
        };
      });
    }
    return [];
  }

  async transfer({ account, to, amount }) {
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

  isValidAddress(address) {
    return utilsApp.throwToBeImplemented(this);
  }

  connectDapp(url) {
    return utilsApp.throwToBeImplemented(this);
  }
}

export default WalletBase;
