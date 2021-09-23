import assert from 'assert';
import ChainManagerBase from '../../../ChainManagerBase';
import OneAccountInfo from '../../../../classes/OneAccountInfo';

class ChainManager extends ChainManagerBase {
  createApiRpc({ url }) {
    return null;
  }

  createApiExplorer({ url }) {
    return null;
  }

  isTokenAddress(tokenAccountInfo) {
    // noop
    return null;
  }

  /**
   *
   * @param tokenAccountInfo
   * @return {OneAccountInfo}
   */
  normalizeAccountUpdatesInfo(tokenAccountInfo) {
    const isToken = this.isTokenAddress(tokenAccountInfo);
    const { balance } = tokenAccountInfo;
    const { decimals } = tokenAccountInfo;
    if (isToken) {
      // * update token balance and decimals
      // balance = 0;
      // decimals = 0;
    } else {
      // * update native balance and decimals
      // balance = 0;
      // decimals = 0;
    }
    return new OneAccountInfo({
      _raw: tokenAccountInfo,
      address: tokenAccountInfo.address,
      balance,
      decimals,
      isToken,
    });
  }

  async sendTransaction({ rawTransaction }) {
    return await this.apiRpc.sendTransaction(rawTransaction);
  }

  addAccountChangeListener(address, handler) {
    return this.apiRpc.addAccountChangeListener(address, (accountInfo) => {
      handler(this.normalizeAccountUpdatesInfo({ ...accountInfo, address }));
    });
  }

  removeAccountChangeListener(id) {
    return this.apiRpc.removeAccountChangeListener(id);
  }

  async getAccountInfo({ address }) {
    const res = await this.apiRpc.getAccountInfo(address);
    const accountInfo = res.account;

    return this.normalizeAccountUpdatesInfo({
      ...accountInfo,
      address,
    });
  }

  async getAccountTokens({ address } = {}) {
    const chainKey = this.options.chainInfo.key;
    const ownerAddress = address || this.options?.accountInfo?.address;
    if (!ownerAddress) {
      return {
        chainKey,
        ownerAddress,
        tokens: [],
      };
    }

    const res = await this.apiRpc.getAccountTokens(ownerAddress);
    return {
      chainKey,
      ownerAddress,
      tokens: res.tokens,
    };
  }

  async getAddAssociateTokenFee() {
    const res = await this.apiRpc.getAddAssociateTokenFee();
    return res?.fee;
  }

  async getTransactionFee() {
    const res = await this.apiRpc.getTransactionFee();
    return res?.fee;
  }

  async getTxHistory({ address, limit = 20 }) {
    const res = await this.apiRpc.getTxHistory({
      address,
      start: 0,
      limit,
    });
    return {
      items: res.items,
    };
  }

  async getLatestBlock() {
    console.log('getEpochInfo');
  }

  async confirmTransaction({ txid }) {
    const res = await this.apiRpc.confirmTransaction(txid);
    return res.transaction;
  }
}

export default ChainManager;
