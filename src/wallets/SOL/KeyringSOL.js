import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Account, PublicKey } from '@solana/web3.js';
import KeyringBase from '../KeyringBase';
import utilsApp from '../../utils/utilsApp';
import HdKeyProvider from './modules/HdKeyProvider';

class KeyringSOL extends KeyringBase {
  constructor(options) {
    super(options);
    this.hdkeyProvider = new HdKeyProvider(this.options);
  }

  _solAccountFromPrivateKey({ privateKey }) {
    return new Account(nacl.sign.keyPair.fromSeed(privateKey).secretKey);
  }

  async getAccountPrivateKey({ seed, path }) {
    const hdPrivateKey = await this._getHdPrivateKey({ seed, path });
    const account = this._solAccountFromPrivateKey({
      privateKey: hdPrivateKey,
    });
    return bs58.encode(account.secretKey);
  }

  privateKeyToAddress({ privateKey }) {
    const account = this._solAccountFromPrivateKey({ privateKey });
    const address = new PublicKey(account.publicKey).toString();
    return address;
  }

  privateKeySign({ privateKey, tx }) {
    const account = this._solAccountFromPrivateKey({ privateKey });
    const txBytes = bs58.decode(tx);
    return bs58.encode(nacl.sign.detached(txBytes, account.secretKey));
  }
}

export default KeyringSOL;
