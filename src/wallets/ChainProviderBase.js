import utilsApp from '../utils/utilsApp';

class ChainProviderBase {
  constructor(options) {
    this.options = options;
  }

  // chain rpc api
  connection = null;

  // block browser api
  browser = null;

  // TODO change to addEventListener ？
  addAccountChangeListener() {
    return utilsApp.throwToBeImplemented(this);
  }

  removeAccountChangeListener() {
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

  getAccountInfo() {
    return utilsApp.throwToBeImplemented(this);
  }

  getAccountTokens() {
    return utilsApp.throwToBeImplemented(this);
  }
}

export default ChainProviderBase;
