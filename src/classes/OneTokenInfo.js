// https://github.com/solana-labs/token-list/blob/main/src/tokens/solana.tokenlist.json

import utilsApp from '../utils/utilsApp';

class OneTokenInfo {
  constructor({
    key = '',
    chainKey = '',
    name = '',
    icon = '',
    isNative = false, // isNativeToken like=BNB、ETH、SOL
    address = '', // token address
    depositAddress = '', // token deposit address
    ownerAddress = '', // account address to which token belongs
    contractAddress = '', // token contract address, mintAddress in SOL
    associatedAddress = '',
  }) {
    this.name = name || (!isNative && utilsApp.shortenAddress(contractAddress));
    this.icon = icon;
    this.isNative = isNative;
    this.address = address;
    this.depositAddress = depositAddress || (isNative && address);
    this.ownerAddress = ownerAddress || (isNative && address);
    this.contractAddress = contractAddress;
    this.associatedAddress = associatedAddress;
    this.chainKey = chainKey;
    this.key = key || this.generateKey();
  }

  generateKey() {
    if (this.isNative) {
      return `${this.chainKey}-${this.ownerAddress}`;
    }
    return `${this.chainKey}-${this.ownerAddress}-${this.contractAddress}`;
  }
}

export default OneTokenInfo;
