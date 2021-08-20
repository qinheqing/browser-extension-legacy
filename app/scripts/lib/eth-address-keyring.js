

export default class AddressKeyring {
  static type = "Watch Account"
  constructor(opts) {
    this.type = AddressKeyring.type;
    this.wallets = [];
    this.address = undefined;
    this.deserialize(opts);
  }

  setAccountToAdd(address) {
    this.address = address
  }

  serialize() {
    return Promise.resolve(this.wallets.slice());
  }

  deserialize(addresses = []) {
    return new Promise((resolve, reject) => {
      this.wallets = addresses;
      resolve();
    });
  }

  addAccounts() {
    return new Promise((resolve, reject) => {
      if (this.address) {
        if (this.wallets.includes(this.address)) {
          reject(`The address is already in the wallet`)
        } else  {
          this.wallets.push(this.address)
          this.address = undefined;
        }
      }
      resolve(this.wallets.slice());
    })
  }

  getAccounts() {
    return Promise.resolve(this.wallets.slice());
  }

  // tx is an instance of the ethereumjs-transaction class.
  signTransaction() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // For eth_sign, we need to sign arbitrary data:
  signMessage() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // For eth_sign, we need to sign transactions:
  newGethSignMessage() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // For personal_sign, we need to prefix the message:
  signPersonalMessage() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // For eth_decryptMessage:
  decryptMessage() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v1() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v3() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v4() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // get public key for nacl
  getEncryptionPublicKey() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  getPrivateKeyFor() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // returns an address specific to an app
  getAppKeyAddress() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  // exportAccount should return a hex-encoded private key:
  exportAccount() {
    return Promise.reject(new Error('Not supported on watch mode'));
  }

  removeAccount(address) {
    if (
      !this.wallets.map((w) => w.toLowerCase()).includes(address.toLowerCase())
    ) {
      throw new Error(`Address ${address} not found in this keyring`);
    }
    this.wallets = this.wallets.filter(
      (w) => w.toLowerCase() !== address.toLowerCase(),
    );
  }
}
