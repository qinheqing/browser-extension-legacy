import assert from 'assert';
import { Conflux, Contract, format } from 'js-conflux-sdk';
import WalletBase from '../../WalletBase';
import utilsApp from '../../../utils/utilsApp';
import optionsHelper from '../../optionsHelper';
import ChainManager from './managers/ChainManager';
import HdKeyManager from './managers/HdKeyManager';
import TokenManager from './managers/TokenManager';
import { CFX_EPOCH_TAG } from './consts/consts';

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
  async signAndSendTxObject({ accountInfo, tx }) {
    // eslint-disable-next-line no-param-reassign
    accountInfo = accountInfo || this.accountInfo;

    // TODO check Conflux._signTransaction how to prepare tx info
    if (!tx.gasPrice) {
      // eslint-disable-next-line no-param-reassign
      tx = await this.addFeeInfoToTx({ tx });
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

  decodeTransactionData({ address, data }) {
    // noop
    console.log({ address, data });
    return {
      instructions: [data],
    };
  }

  async addFeeInfoToTx({ tx, feeInfo }) {
    if (!feeInfo) {
      // eslint-disable-next-line no-param-reassign
      feeInfo = await this.fetchTransactionFeeInfo(tx);
    }
    const { gasUsed, gasPrice, storageLimit } = feeInfo;
    return {
      ...tx,
      gasPrice,
      gas: gasUsed, // gasLimit
      storageLimit,
    };
  }

  async addBlockInfoToTx({ tx, accountInfo }) {
    const rpc = this.chainManager.apiRpc;

    // TODO batch rpc call
    const status = await rpc.getStatus(CFX_EPOCH_TAG);
    const nonce = await rpc.getNextNonce(accountInfo.address, CFX_EPOCH_TAG);
    const epochHeight = await rpc.getEpochNumber(CFX_EPOCH_TAG);
    return {
      ...tx,
      chainId: status.chainId, // endpoint status.chainId
      nonce: nonce.toString ? nonce.toString() : nonce, // sender next nonce
      epochHeight,
    };
  }
}

export default Wallet;
