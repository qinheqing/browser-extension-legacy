// https://github.com/solana-labs/token-list/blob/main/src/tokens/solana.tokenlist.json

import utilsApp from '../utils/utilsApp';

class OneTokenInfo {
  constructor({
    key = '',
    chainKey = '',
    name = '',
    symbol = '',
    icon = '',
    decimals,
    isNative = false, // isNativeToken like=BNB、ETH、SOL
    address = '', // token address
    depositAddress = '', // token deposit address
    ownerAddress = '', // account address to which token belongs
    contractAddress = '', // token contract address, mintAddress in SOL
    associatedAddress = '',
    ...others
  }) {
    Object.assign(this, others);

    this.name = name;
    this.symbol = symbol;
    this.symbolOrName = this.symbol || this.name || '未知资产';
    this.icon = icon;
    this.decimals = decimals;
    this.isNative = isNative;
    this.address = address;
    this.depositAddress = depositAddress || (isNative && address);
    this.ownerAddress = ownerAddress || (isNative && address);
    this.contractAddress = contractAddress;
    this.contractAddressShort = utilsApp.shortenAddress(contractAddress);
    this.symbolDisplay =
      this.symbol ||
      utilsApp.shortenAddress(contractAddress, {
        size: 4,
        head: false,
      });
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