import bgGetRootController from './bg/bgGetRootController';
import { HdKeyProviderBase } from './HdKeyProvider';

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

  async getRootSeed() {
    const acc =
      bgGetRootController().keyringController.getKeyringsByType(
        'HD Key Tree',
      )[0];
    const { mnemonic } = acc;
    const seed = await this.hdkeyProvider.mnemonicToSeed({ mnemonic });
    return seed;
  }
}

export default KeyringBase;
