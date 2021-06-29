import HdKey from 'hdkey';
import utilsApp from '../utils/utilsApp';

class HdKeyProviderBase {
  constructor(options) {
    this.options = options;
  }

  get hdPathTemplate() {
    return this.options.hdPathTemplate;
  }

  createHdPath({ index, template }) {
    return utilsApp.formatTemplate(template || this.hdPathTemplate, { index });
  }

  async mnemonicToSeed({ mnemonic }) {
    const bip39 = await import('bip39');
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid seed words');
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    return Buffer.from(seed);
  }

  async fromMasterSeed({ seed }) {
    return {
      publicKey: Buffer.from('00', 'hex'),
      privateKey: Buffer.from('00', 'hex'),
      chainCode: Buffer.from('00', 'hex'),
      _toBeImplemented_: utilsApp.throwToBeImplemented(this),
    };
  }

  async derivePath({ seed, path }) {
    return {
      publicKey: Buffer.from('00', 'hex'),
      privateKey: Buffer.from('00', 'hex'),
      chainCode: Buffer.from('00', 'hex'),
      _toBeImplemented_: utilsApp.throwToBeImplemented(this),
    };
  }
}

class HdKeyProviderBip32 extends HdKeyProviderBase {
  normalizeKeyInfo(hdkey) {
    const { publicKey, privateKey, chainCode } = hdkey;
    return { hdkey, publicKey, privateKey, chainCode };
  }

  async fromMasterSeed({ seed }) {
    const hdkey = await HdKey.fromMasterSeed(seed);
    return this.normalizeKeyInfo(hdkey);
  }

  async derivePath({ seed, path }) {
    /*
    const { publicKey, privateKey, chainCode } = await this.fromMasterSeed({
      seed,
    });
    const hdkey = new HdKey();
    hdkey.publicKey = publicKey;
    hdkey.privateKey = privateKey;
    hdkey.chainCode = chainCode;
    */

    // const hdkey = await HdKey.fromMasterSeed(seed);

    const { hdkey } = await this.fromMasterSeed({ seed });

    const derivedHdKey = hdkey.derive(path);
    return this.normalizeKeyInfo(derivedHdKey);
  }
}

class HdKeyProviderEd25519 extends HdKeyProviderBase {
  async getHdKeyEd25519() {
    return await import('ed25519-hd-key');
  }

  async normalizeKeyInfo(data) {
    const hdkey = await this.getHdKeyEd25519();
    const { key, chainCode } = data;
    const publicKey = hdkey.getPublicKey(key);
    return {
      hdkey,
      chainCode,
      publicKey,
      privateKey: key,
    };
  }

  async fromMasterSeed({ seed }) {
    const hdkey = await this.getHdKeyEd25519();
    const data = hdkey.getMasterKeyFromSeed(seed);
    return await this.normalizeKeyInfo(data);
  }

  async derivePath({ seed, path }) {
    const hdkey = await this.getHdKeyEd25519();
    const data = hdkey.derivePath(path, seed);
    return await this.normalizeKeyInfo(data);
  }
}

export { HdKeyProviderBase, HdKeyProviderBip32, HdKeyProviderEd25519 };
