import nacl from 'tweetnacl';
import KeyringBase from '../KeyringBase';
import HdKeyProvider from './modules/HdKeyProvider';

class KeyringSOL extends KeyringBase {
  constructor(options) {
    super(options);
    this.hdkeyProvider = new HdKeyProvider(this.options);
  }

  async getAddressesHdWallet({ indexes = [0], ...others }) {
    const hdPathList = indexes.map((index) =>
      this.hdkeyProvider.createHdPath({ index }),
    );
    const seed = await this.getRootSeed();
    const addresses = await Promise.all(
      hdPathList.map(async (path, i) => {
        const dpath = await this.hdkeyProvider.derivePath({ seed, path });
        const account = new global.solanaWeb3.Account(
          nacl.sign.keyPair.fromSeed(dpath.privateKey).secretKey,
        );
        const address = new global.solanaWeb3.PublicKey(
          account.publicKey,
        ).toString();

        return {
          address,
          ...this.buildAddressMeta({ index: indexes[i] }),
        };
      }),
    );

    return addresses;
  }
}

export default KeyringSOL;
