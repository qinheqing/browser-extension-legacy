import utilsApp from '../utils/utilsApp';

class ChainProviderBase {
  constructor(options) {
    this.options = options;
  }

  // chain rpc api, web3.js
  connection = null;

  // block browser api
  browser = null;

  // TODO change to addEventListener ？
  addAccountChangeListener(address, handler) {
    return utilsApp.throwToBeImplemented(this);
  }

  removeAccountChangeListener(id) {
    return utilsApp.throwToBeImplemented(this);
  }

  // eth-block-tracker
  addRecentBlockReceiveListener() {
    return utilsApp.throwToBeImplemented(this);
  }

  async sendTransaction() {
    return utilsApp.throwToBeImplemented(this);
  }

  // https://www.npmjs.com/package/eth-block-tracker
  fetchTransactions() {
    return utilsApp.throwToBeImplemented(this);
  }

  // USE getAccountInfo instead
  getBalances() {
    return utilsApp.throwToBeImplemented(this);
  }

  // TODO 拆分为 getAccountInfo getTokenInfo getBalanceInfo
  getAccountInfo() {
    return utilsApp.throwToBeImplemented(this);
  }

  getAccountTokens({ address } = {}) {
    return utilsApp.throwToBeImplemented(this);
  }
}

export default ChainProviderBase;
