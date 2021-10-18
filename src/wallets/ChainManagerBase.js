import utilsApp from '../utils/utilsApp';
import OneAccountInfo from '../classes/OneAccountInfo';
import optionsHelper from './helpers/optionsHelper';

class ChainManagerBase {
  constructor(options, wallet) {
    this.options = options;
    this.wallet = wallet;
  }

  get apiRpc() {
    this._apiRpc =
      this._apiRpc ||
      this.createApiRpc({
        url: this.getFirstRpcUrl(),
        chainId: optionsHelper.getChainId(this.options),
      });
    return this._apiRpc;
  }

  get apiExplorer() {
    this._apiExplorer =
      this._apiExplorer ||
      this.createApiExplorer({
        url: this.getFirstExplorerUrl(),
      });
    return this._apiExplorer;
  }

  // chain rpc api, web3.js
  // connection = null;

  // block browser api
  // browser = null;

  extractBalanceInfo(rpcAccountInfo) {
    // 1. native token
    // 2. token
    // return { balance, decimals, isNativeAccount }
    return utilsApp.throwToBeImplemented(this);
  }

  async getTransactions({ ids = [] }) {
    return utilsApp.throwToBeImplemented(this);
  }

  /**
   *
   * @param rpcAccountInfo
   * @return {OneAccountInfo}
   */
  normalizeAccountUpdatesInfo(rpcAccountInfo) {
    const { balance, decimals, isNativeAccount, ...others } =
      this.extractBalanceInfo(rpcAccountInfo);

    return new OneAccountInfo({
      _raw: rpcAccountInfo,
      address: rpcAccountInfo.address,
      balance,
      decimals,
      isToken: !isNativeAccount,
      isNativeAccount,
      ...others,
    });
  }

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

  // return txid
  async sendTransaction() {
    return utilsApp.throwToBeImplemented(this);
  }

  // https://www.npmjs.com/package/eth-block-tracker
  // getConfirmedSignaturesForAddress2: https://solana-labs.github.io/solana-web3.js/classes/connection.html#getconfirmedsignaturesforaddress2
  fetchTransactions() {
    return utilsApp.throwToBeImplemented(this);
  }

  fetchTransactionFeeInfo(tx) {
    return utilsApp.throwToBeImplemented(this);
  }

  async getTxHistory() {
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

  createApiRpc({ url }) {
    return utilsApp.throwToBeImplemented(this);
  }

  createApiExplorer({ url }) {
    return utilsApp.throwToBeImplemented(this);
  }

  getFirstRpcUrl() {
    return this.options?.chainInfo?.rpc?.[0];
  }

  getFirstExplorerUrl() {
    return this.options?.chainInfo?.browser?.[0]?.api || '';
  }

  // get tokenMeta by RPC, fallback to tokenList.json in future
  async fetchTokenMeta() {
    return utilsApp.throwToBeImplemented(this);
  }

  async confirmTransaction() {
    return utilsApp.throwToBeImplemented(this);
  }

  async confirmTransactionCancel() {
    return utilsApp.throwToBeImplemented(this);
  }
}

export default ChainManagerBase;
