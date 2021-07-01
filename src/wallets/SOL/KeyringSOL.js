import nacl from 'tweetnacl';
import bs58 from 'bs58';
import KeyringBase from '../KeyringBase';
import HdKeyProvider from './modules/HdKeyProvider';

class KeyringSOL extends KeyringBase {
  constructor(options) {
    super(options);
    this.hdkeyProvider = new HdKeyProvider(this.options);
  }

  _solAccountFromPrivateKey({ privateKey }) {
    return new global.solanaWeb3.Account(
      nacl.sign.keyPair.fromSeed(privateKey).secretKey,
    );
  }

  privateKeyToAddress({ privateKey }) {
    const account = this._solAccountFromPrivateKey({ privateKey });
    const address = new global.solanaWeb3.PublicKey(
      account.publicKey,
    ).toString();
    return address;
  }

  privateKeySign({ privateKey, tx }) {
    const account = this._solAccountFromPrivateKey({ privateKey });
    const txBytes = bs58.decode(tx);
    return bs58.encode(nacl.sign.detached(txBytes, account.secretKey));
  }
}

export default KeyringSOL;
