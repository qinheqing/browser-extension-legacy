import utilsApp from '../utils/utilsApp';

class OneChainInfo {
  constructor({
    baseChain = '', // ETH
    key = '',
    name = '', // display name: BSC
    fullName = '', // full display name: Binance Smart Chain
    description = '',
    internalChainId = -1, //
    rpc = [],
    scan = [],
    currency = '', // BNB
    browser = [],
    isCustom = false, // is built-in or user custom Chain
    isTestNet = false,
    accountNamePrefix = '',
    ...others
  }) {
    this.baseChain = baseChain;
    this.name = name;
    this.fullName = fullName;
    this.description = description;
    this.rpc = rpc;
    // https://chainid.network/
    this.internalChainId = internalChainId; // internalChainId or chainId
    this.currency = currency;
    this.browser = browser;
    this.isCustom = isCustom;
    this.isTestNet = isTestNet;
    this.accountNamePrefix = accountNamePrefix;
    Object.assign(this, others);
    // uniq key
    this.key = key || this.generateKey();
  }

  generateKey() {
    const testNetFlag = this.isTestNet ? 'TestNet' : 'MainNet';
    return `${this.baseChain}_${
      this.currency
    }_${testNetFlag}@${utilsApp.uuid()}`;
  }

  generateAccountName({ index }) {
    if (this.accountNamePrefix) {
      return `${this.accountNamePrefix}-${index}`;
    }
    if (this.isCustom) {
      return `${this.currency}-${index}`;
    }
    return `${this.key}-${index}`;
  }
}

export default OneChainInfo;
