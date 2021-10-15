import assert from 'assert';
import { Conflux, Contract, format } from 'js-conflux-sdk';
import WalletBase from '../../WalletBase';
import utilsApp from '../../../utils/utilsApp';
import optionsHelper from '../../optionsHelper';
import {
  getTokenData,
  parseErc20Transaction,
} from '../../../../ui/app/helpers/utils/transactions.util';
import utilsNumber from '../../../utils/utilsNumber';
import ChainManager from './managers/ChainManager';
import HdKeyManager from './managers/HdKeyManager';
import TokenManager from './managers/TokenManager';
import { CFX_EPOCH_TAG } from './consts/consts';
import utils from './utils/utils';

class Wallet extends WalletBase {
  get optionsDefault() {
    return {};
  }

  chainManager = new ChainManager(this.options, this);

  hdkeyManager = new HdKeyManager(this.options, this);

  tokenManager = new TokenManager(this.options, this);

  // create tx from ix array
  async _createTxObject({ accountInfo, instructions = [] }) {
    // const tx = utilsApp.throwToBeImplemented(this);
    const tx = instructions[0];

    const txNew = {
      // always create new Object, as tx may be a Contract Class Instance, NOT plain object
      ...tx,
    };
    return txNew;
  }

  async createAddTokenTxObject({ accountInfo, contract }) {
    const ix = null;
    return this._createTxObject({
      accountInfo,
      instructions: [ix],
    });
  }

  async createTransferTokenTxObject({
    accountInfo,
    to,
    amount,
    contract,
    from,
    decimals,
  }) {
    const fromAddress = accountInfo.address;
    const fromAddressHex = format.hexAddress(fromAddress);
    const toAddressHex = format.hexAddress(to);
    const contractApi = this.chainManager.apiRpc.CRC20(contract);

    // create erc20 tx object by conflux.js SDK
    const transferIx = contractApi.transfer(to, amount);
    transferIx.from = fromAddress;

    const txObj = await this._createTxObject({
      accountInfo,
      instructions: [transferIx],
    });
    return txObj;
  }

  async createTransferTxObject({ accountInfo, to, amount }) {
    // const transferIx = utilsApp.throwToBeImplemented(this);
    const rpc = this.chainManager.apiRpc;

    const transferIx = {
      from: accountInfo.address,
      to, // receiver address
      value: amount, // Drip.fromCFX(0.1), // 0.1 CFX = 100000000000000000 Drip
      data: undefined, // 0x or null
    };

    return this._createTxObject({
      accountInfo,
      instructions: [transferIx],
    });
  }

  // txObject -> txStr -> txStrSigned -> signedTx -> signedTxRaw -> send(raw)
  async signAndSendTxObject({ accountInfo, feeInfo, tx }) {
    // eslint-disable-next-line no-param-reassign
    accountInfo = accountInfo || this.accountInfo;

    // TODO check Conflux._signTransaction how to prepare tx info
    if (!tx.gasPrice || !tx.gas) {
      // eslint-disable-next-line no-param-reassign
      tx = await this.addFeeInfoToTx({ tx, feeInfo });
    }

    if (!tx.nonce) {
      // eslint-disable-next-line no-param-reassign
      tx = await this.addBlockInfoToTx({ tx, accountInfo });
    }

    // const txStr = utilsApp.throwToBeImplemented(this);
    const txStr = JSON.stringify(tx);

    // https://github.com/Conflux-Chain/js-conflux-sdk/blob/master/src/Transaction.js#L111
    // const txStr = tx.serialize(buffer); // serialize call signTx
    const txStrSigned = await this.signTx(txStr);

    // txStrSigned -> signedTx
    // const rawTxSigned = await this.serializeTxObject(tx); // signedTx -> signedTxRaw

    const signedTxRaw = txStrSigned;
    const txid = await this.sendTx(signedTxRaw);
    return txid;
  }

  async serializeTxObject(tx) {
    return tx.serialize();
  }

  async requestAirdrop() {
    const { address } = this.accountInfo;
    // return requestAirdrop(address);
  }

  getChainId() {
    const chainId = optionsHelper.getChainId(this.options);
    return chainId;
  }

  isValidAddress(address = '') {
    // eslint-disable-next-line no-param-reassign
    address = address.address || address;
    try {
      // TODO
      const networkId = optionsHelper.getChainId(this.options);
      const addr1 = format.hexAddress(address);
      const addr2 = format.address(address, networkId);
      return true;
      // eslint-disable-next-line no-unreachable
    } catch (err) {
      return false;
    }
  }

  _getContractMethodParamValue(data, paramName) {
    return data?.args?.[paramName]?.toString();
  }

  _toCfxAddressSafe(address) {
    const networkId = optionsHelper.getChainId(this.options);
    return utils.formatToAddressSafe(address, networkId);
  }

  async decodeTransactionData({ address, data }) {
    const txData = { ...data };
    txData.from = this._toCfxAddressSafe(txData.from);
    txData.to = this._toCfxAddressSafe(txData.to);

    // TODO try decode ERC20 by getTokenData, pick approve method
    // noop
    const decodedData = parseErc20Transaction(data);
    let parsed = null;
    if (decodedData && decodedData.name) {
      const method = decodedData.name;
      const tokenHex = data.to;
      const token = this._toCfxAddressSafe(tokenHex);
      let tokenInfo = null;
      try {
        tokenInfo = await this.chainManager.fetchTokenMeta({ address: token });
      } catch (error) {
        console.error(error);
      }
      const spenderHex = this._getContractMethodParamValue(
        decodedData,
        '_spender',
      );
      const spender = this._toCfxAddressSafe(spenderHex);
      const amount = this._getContractMethodParamValue(decodedData, '_value');
      parsed = {
        method,
        approve: {
          token,
          tokenHex,
          tokenInfo,
          spender,
          spenderHex,
          amount,
        },
      };
    }
    txData.parsed = parsed;

    // parse feeInfo
    let feeInfo = null;
    if (data.gas && data.gasPrice && data.storageLimit) {
      let { gas, gasPrice, storageLimit } = data;
      gas = utilsNumber.hexToIntString(gas);
      gasPrice = utilsNumber.hexToIntString(gasPrice);
      storageLimit = utilsNumber.hexToIntString(storageLimit);
      feeInfo = {
        fee: utilsNumber.bigNum(gasPrice).times(gas).toFixed(),
        gas,
        gasPrice,
        storageLimit,
      };
    }
    txData.feeInfo = feeInfo;

    console.log('decodeTransactionData', {
      address,
      data,
      decodedData,
      feeInfo,
      parsed,
    });

    return {
      instructions: [txData],
    };
  }

  async addFeeInfoToTx({ tx, feeInfo }) {
    if (!feeInfo || !Object.keys(feeInfo).length) {
      // eslint-disable-next-line no-param-reassign
      feeInfo = await this.fetchTransactionFeeInfo(tx);
    }
    const { gas, gasPrice, storageLimit } = feeInfo;
    return {
      ...tx,
      gasPrice,
      gas, // gasLimit
      storageLimit,
    };
  }

  async addBlockInfoToTx({ tx, accountInfo }) {
    const rpc = this.chainManager.apiRpc;
    let chainId = this.getChainId();

    // TODO batch rpc call
    if (!chainId) {
      const status = await rpc.getStatus(CFX_EPOCH_TAG);
      chainId = status.chainId;
    }

    const nonce = await rpc.getNextNonce(accountInfo.address, CFX_EPOCH_TAG);
    const epochHeight = await rpc.getEpochNumber(CFX_EPOCH_TAG);
    return {
      ...tx,
      chainId, // endpoint status.chainId
      nonce: nonce.toString ? nonce.toString() : nonce, // sender next nonce
      epochHeight,
    };
  }
}

export default Wallet;
