import assert from 'assert';
import { Conflux, format } from 'js-conflux-sdk';
import ChainManagerBase from '../../../ChainManagerBase';
import OneAccountInfo from '../../../../classes/OneAccountInfo';
import optionsHelper from '../../../optionsHelper';
import utilsApp from '../../../../utils/utilsApp';
import utilsNumber from '../../../../utils/utilsNumber';

const EpochTag = format.epochNumber.$or(undefined)('latest_state');

class ChainManager extends ChainManagerBase {
  createApiRpc({ url, chainId }) {
    const confluxRpc = new Conflux({
      url,
      logger: console,
      networkId: chainId,
      // timeout: 300 * 1000, // request timeout in ms, default 300*1000 ms === 5 minute
    });
    global.$$confluxRpc = confluxRpc;
    return confluxRpc;
  }

  createApiExplorer({ url }) {
    return null;
  }

  async sendTransaction({ rawTransaction }) {
    // https://confluxnetwork.gitbook.io/js-conflux-sdk/docs/how_to_send_tx#sendrawtransaction
    return await this.apiRpc.sendRawTransaction(rawTransaction);
  }

  addAccountChangeListener(address, handler) {
    // CFX do not support accountChange listener
    return null;
  }

  removeAccountChangeListener(id) {
    // CFX do not support accountChange listener
    return null;
  }

  extractBalanceInfo(rpcAccountInfo) {
    const isNativeAccount = true;
    let { accumulatedInterestReturn, balance, collateralForStorage, nonce } =
      rpcAccountInfo;
    accumulatedInterestReturn = accumulatedInterestReturn?.toString();
    balance = balance?.toString();
    collateralForStorage = collateralForStorage?.toString();
    nonce = nonce?.toString();
    let decimals = 0;
    if (isNativeAccount) {
      decimals = optionsHelper.getNativeTokenDecimals(this.options);
    }

    return {
      balance,
      decimals,
      isNativeAccount,
    };
  }

  async getAccountInfo({ address, isNative, symbol, ownerAddress }) {
    // https://confluxnetwork.gitbook.io/js-conflux-sdk/api/conflux#Conflux.js/Conflux/getAccount
    // const accountInfo1 = await this.apiRpc.getAccount(address, 'latest_state');

    // https://github.com/Conflux-Chain/js-conflux-sdk/blob/master/src/Conflux.js#L351

    const reqId = `${symbol}_${address}_${this.apiRpc.provider.requestId()}`;
    let batchCallPayload = [];
    if (isNative) {
      batchCallPayload = [
        {
          id: reqId,
          method: 'cfx_getAccount',
          params: [address, EpochTag],
        },
      ];
    } else {
      let ownerAddressHex = format.hexAddress(ownerAddress);
      ownerAddressHex = ownerAddressHex.substr(2);
      batchCallPayload = [
        {
          id: reqId,
          method: 'cfx_call',
          params: [
            {
              to: address, // token contract address
              // call balanceOf() of contract
              data: `0x70a08231000000000000000000000000${ownerAddressHex}`,
            },
            EpochTag,
          ],
        },
      ];
    }

    const res = await this.apiRpc.provider.batch(batchCallPayload);
    let accountInfo = {};
    if (isNative) {
      accountInfo = format.account(res[0]);
    } else {
      accountInfo = {
        balance: utilsNumber.hexToIntString(res),
      };
    }

    /*
    accumulatedInterestReturn: o [sign: false]
    address: "CFX:TYPE.USER:AAJHZGS3C467SM7H8TK0FS1KJM506TRKMUS1NXXV33"
    admin: "CFX:TYPE.NULL:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0SFBNJM2"
    balance: o [sign: false]
    codeHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    collateralForStorage: o [sign: false]
    nonce: o [sign: false]
     */

    return this.normalizeAccountUpdatesInfo({
      ...accountInfo,
      address,
    });
  }

  async getAccountTokens({ address } = {}) {
    // TODO get account tokens from explorer api
    const chainKey = this.options.chainInfo.key;
    const ownerAddress = address || this.options?.accountInfo?.address;
    if (!ownerAddress) {
      return {
        chainKey,
        ownerAddress,
        tokens: [],
      };
    }

    return {
      chainKey,
      ownerAddress,
      tokens: [],
    };

    // const res = await this.apiRpc.getAccountTokens(ownerAddress);
    // return {
    //   chainKey,
    //   ownerAddress,
    //   tokens: res.tokens,
    // };
  }

  async getAddAssociateTokenFee() {
    return '0';
  }

  // TODO pass txObject, userInputs( gasPrice,gasLimit ) to estimate fee
  async getTransactionFee() {
    // const res = await this.apiRpc.getTransactionFee();
    return NaN;
  }

  async getTxHistory({ address, limit = 15 }) {
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
