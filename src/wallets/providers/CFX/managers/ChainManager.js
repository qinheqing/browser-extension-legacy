import assert from 'assert';
import { Conflux, format, Contract } from 'js-conflux-sdk';
import axios, { AxiosInstance } from 'axios';
import ChainManagerBase from '../../../ChainManagerBase';
import OneAccountInfo from '../../../../classes/OneAccountInfo';
import optionsHelper from '../../../optionsHelper';
import utilsApp from '../../../../utils/utilsApp';
import utilsNumber from '../../../../utils/utilsNumber';
import { CFX_EPOCH_TAG } from '../consts/consts';
import { CONST_ERC20_METHODS_HEX } from '../../../../consts/consts';
import utils from '../utils/utils';

class ChainManager extends ChainManagerBase {
  createApiRpc({ url, chainId }) {
    const confluxRpc = new Conflux({
      url,
      logger: console,
      networkId: chainId,
      // timeout: 300 * 1000, // request timeout in ms, default 300*1000 ms === 5 minute
    });
    global.$ok_confluxRpc = confluxRpc;
    return confluxRpc;
  }

  createApiExplorer({ url }) {
    const requests = axios.create({
      baseURL: url,
      // timeout: 30 * 1000,
      headers: {
        'X-Custom-Header': 'foobar',
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
      },
    });
    return requests;
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

  _createErc20Request({ to, data }) {
    return {
      method: 'cfx_call',
      params: [
        {
          to, // token contract address
          data,
        },
        CFX_EPOCH_TAG,
      ],
    };
  }

  _createErc20TokenMetaRequest(address) {
    return [
      this._createErc20Request({
        to: address,
        data: `${CONST_ERC20_METHODS_HEX.name}`,
      }),
      this._createErc20Request({
        to: address,
        data: `${CONST_ERC20_METHODS_HEX.symbol}`,
      }),
      this._createErc20Request({
        to: address,
        data: `${CONST_ERC20_METHODS_HEX.decimals}`,
      }),
    ];
  }

  async getAccountInfo({ address, isNative, symbol, ownerAddress }) {
    // https://confluxnetwork.gitbook.io/js-conflux-sdk/api/conflux#Conflux.js/Conflux/getAccount
    // const accountInfo1 = await this.apiRpc.getAccount(address, 'latest_state');

    // https://github.com/Conflux-Chain/js-conflux-sdk/blob/master/src/Conflux.js#L351

    const reqId = `getAccountInfo__${symbol}_${address}_${this.apiRpc.provider.requestId()}`;
    let batchCallPayload = [];
    if (isNative) {
      batchCallPayload = [
        {
          id: reqId,
          method: 'cfx_getAccount',
          params: [address, CFX_EPOCH_TAG],
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
              data: `${CONST_ERC20_METHODS_HEX.balanceOf}000000000000000000000000${ownerAddressHex}`,
            },
            CFX_EPOCH_TAG,
          ],
        },
      ];
    }

    // TODO res can be Error object, should check this
    const res = await this.apiRpc.provider.batch(batchCallPayload);
    let accountInfo = {};
    if (isNative) {
      accountInfo = format.account(res[0]);
    } else {
      accountInfo = {
        ownerAddress,
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

  async fetchTransactionFeeInfo(tx) {
    // TODO calculate default fee here, ex: 21000
    if (
      !tx ||
      !this.wallet.isValidAddress(tx.to) ||
      !this.wallet.isValidAddress(tx.from)
    ) {
      return { fee: NaN };
    }

    const rpc = this.apiRpc;
    // const res = await this.apiRpc.fetchTransactionFeeInfo(tx);
    const gasPrice = await rpc.getGasPrice(CFX_EPOCH_TAG);
    const estimate = await rpc.estimateGasAndCollateral(tx, CFX_EPOCH_TAG);
    const { gasLimit, gasUsed, storageCollateralized } = estimate;
    const gasPriceStr = gasPrice.toString();
    const gasUsedStr = gasUsed.toString();
    const storageLimitStr = storageCollateralized.toString();
    return {
      fee: utilsNumber.bigNum(gasPriceStr).times(gasUsedStr).toFixed(),
      gasLimitMax: gasLimit.toString(),
      storageCollateralized,
      // read by addFeeInfoToTx()
      gas: gasUsedStr,
      gasPrice: gasPriceStr,
      storageLimit: storageLimitStr,
    };
  }

  async getTxHistory({ address, limit = 20 }) {
    // https://api.confluxscan.net/doc
    const res = await this.apiExplorer.get('/account/transactions', {
      params: {
        account: address,
        skip: 0,
        limit,
      },
    });
    const resData = res.data;
    let items = [];
    if (resData.code === 0 && resData?.data?.list) {
      items = resData?.data?.list;
    }
    return {
      items,
    };
  }

  async getLatestBlock() {
    console.log('getEpochInfo');
  }

  confirmCheckMap = {};

  async confirmTransaction({ txid }) {
    const res = await this._confirmedTransaction(txid, { threshold: 0.95 });
    return res;
  }

  confirmTransactionCancel({ txid }) {
    delete this.confirmCheckMap[txid];
    return true;
  }

  async _confirmedTransaction(
    transactionHash,
    { delta = 1000, timeout = 30 * 60 * 1000, threshold = 1e-8 } = {},
  ) {
    this.confirmCheckMap[transactionHash] = true;
    const startTime = Date.now();

    for (
      let lastTime = startTime;
      lastTime < startTime + timeout;
      lastTime = Date.now()
    ) {
      if (!this.confirmCheckMap[transactionHash]) {
        throw new Error('confirmTransaction cancelled');
      }
      const receipt = await this._executedTransaction(transactionHash, {
        delta,
        timeout,
      });
      // must get receipt every time, cause blockHash might change
      const risk = await this.apiRpc.getConfirmationRiskByHash(
        receipt.blockHash,
      );
      console.log('getConfirmationRiskByHash', risk);
      // block reverted risk is between 0-1, closing 0 is more safe
      //    0.9 -> 0.001
      if (risk <= threshold) {
        return receipt;
      }

      await utilsApp.delay(lastTime + delta - Date.now());
    }

    throw new Error(
      `wait transaction "${transactionHash}" confirmed timeout after ${
        Date.now() - startTime
      } ms`,
    );
  }

  async _executedTransaction(
    transactionHash,
    { delta = 1000, timeout = 5 * 60 * 1000 } = {},
  ) {
    const startTime = Date.now();

    for (
      let lastTime = startTime;
      lastTime < startTime + timeout;
      lastTime = Date.now()
    ) {
      const receipt = await this.apiRpc.getTransactionReceipt(transactionHash);
      if (receipt) {
        if (receipt.outcomeStatus !== 0) {
          throw new Error(
            `transaction "${transactionHash}" executed failed, outcomeStatus ${receipt.outcomeStatus}`,
          );
        }
        return receipt;
      }

      await utilsApp.delay(lastTime + delta - Date.now());
    }

    throw new Error(
      `wait transaction "${transactionHash}" executed timeout after ${
        Date.now() - startTime
      } ms`,
    );
  }

  // https://confluxnetwork.gitbook.io/js-conflux-sdk/docs/how_to_send_tx#transactions-stage
  async getTransactions({ ids = [] }) {
    if (ids.length > 1) {
      throw new Error('multiple transactions fetch NOT supported');
    }
    // TODO batch rpc call getTransactionByHash,
    //    and getBlockByHash to fill timestamp field
    const res = await this.apiRpc.getTransactionByHash(ids[0]);
    console.log('getTransactionByHash', res);
    return {
      items: [res],
    };
  }

  async fetchTokenMeta({ address }) {
    // eslint-disable-next-line no-param-reassign
    address = utils.formatToAddress(address);

    /* */
    const contractApi = this.apiRpc.CRC20(address);
    // const balance = await contractApi.balanceOf(fromAddressHex);
    const name = await contractApi.name();
    const symbol = await contractApi.symbol();
    const decimals = await contractApi.decimals();

    // const payload = this._createErc20TokenMetaRequest(address);
    // const res = await this.apiRpc.provider.batch(payload);
    // RPC result name,symbol should decode by abi
    // const { name, symbol, decimals } = res;

    const tokenMeta = {
      name,
      symbol,
      decimals: decimals.toString(),
    };
    console.log('fetchTokenMeta by chain', tokenMeta);
    return tokenMeta;
  }
}

export default ChainManager;
