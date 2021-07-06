import utilsApp from '../utils/utilsApp';
import bgGetRootController from './bg/bgGetRootController';
import { HdKeyProviderBase } from './HdKeyProvider';

// TODO merge KeyringBase: HardwareKeyring、SingleChainKeyring、HdWalletKeyring
class KeyringBase {
  constructor(options) {
    this.options = options;
    this.hdkeyProvider = new HdKeyProviderBase(this.options);
  }

  buildAddressMeta({ index, hdPath }) {
    // AddressInfo?  AccountInfo?
    return {
      chainKey: this.options?.chainInfo?.key, // read from chainInfo
      type: this.options?.accountInfo?.type,
      path: hdPath || this.hdkeyProvider.createHdPath({ index }),
      hardwareModel: this.options?.accountInfo?.hardwareModel, // read from accountInfo
      baseChain: this.options?.chainInfo?.baseChain, // read from chainInfo.baseChain
      hdPathIndex: index,
      hdPathTemplate: this.hdkeyProvider.hdPathTemplate,
    };
  }

  async _getHdRootSeed() {
    const appHdAccount =
      bgGetRootController().keyringController.getKeyringsByType(
        'HD Key Tree',
      )?.[0];
    const { mnemonic } = appHdAccount;
    const seed = await this.hdkeyProvider.mnemonicToSeed({ mnemonic });
    return seed;
  }

  async _getHdPrivateKey({ seed, path }) {
    const _seed = seed || (await this._getHdRootSeed());
    const dpath = await this.hdkeyProvider.derivePath({ seed: _seed, path });
    return dpath.privateKey;
  }

  async getAddressesByHdWallet({ indexes = [0], ...others }) {
    const hdPathList = indexes.map((index) =>
      this.hdkeyProvider.createHdPath({ index }),
    );
    const seed = await this._getHdRootSeed();
    const addresses = await Promise.all(
      hdPathList.map(async (path, i) => {
        const privateKey = await this._getHdPrivateKey({ seed, path });
        const address = await this.privateKeyToAddress({ privateKey });
        return {
          address,
          ...this.buildAddressMeta({ index: indexes[i] }),
        };
      }),
    );

    return addresses;
  }

  async signTxByHdWallet({ tx, hdPath, ...others }) {
    const privateKey = await this._getHdPrivateKey({ path: hdPath });
    return this.privateKeySign({ privateKey, tx });
  }

  privateKeyToAddress({ privateKey }) {
    return utilsApp.throwToBeImplemented(this);
  }

  privateKeySign({ privateKey, tx }) {
    return utilsApp.throwToBeImplemented(this);
  }
}

export default KeyringBase;
