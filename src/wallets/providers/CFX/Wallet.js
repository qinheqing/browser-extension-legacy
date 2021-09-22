import assert from 'assert';
import { Conflux, Contract, format } from 'js-conflux-sdk';
import WalletBase from '../../WalletBase';
import utilsApp from '../../../utils/utilsApp';
import ChainManager from './managers/ChainManager';
import HdKeyManager from './managers/HdKeyManager';
import TokenManager from './managers/TokenManager';
import { CFX_EPOCH_TAG } from './consts/consts';

class Wallet extends WalletBase {
  get optionsDefault() {
    return {};
  }

  chainManager = new ChainManager(this.options);

  hdkeyManager = new HdKeyManager(this.options);

  tokenManager = new TokenManager(this.options);

  // create tx from ix array
  async _createTxObject({ accountInfo, instructions = [] }) {
    const rpc = this.chainManager.apiRpc;
    // const tx = utilsApp.throwToBeImplemented(this);
    const tx = instructions[0];

    // TODO batch rpc call
    const status = await rpc.getStatus(CFX_EPOCH_TAG);
    const nonce = await rpc.getNextNonce(accountInfo.address, CFX_EPOCH_TAG);
    const epochHeight = await rpc.getEpochNumber(CFX_EPOCH_TAG);
    const gasPrice = await rpc.getGasPrice(CFX_EPOCH_TAG);
    const estimate = await rpc.estimateGasAndCollateral(tx, CFX_EPOCH_TAG);
    const { gasLimit, gasUsed, storageCollateralized } = estimate;

    // always create new Object, as tx may be a Contract Class Instance, NOT plain object
    const txNew = {
      ...tx,

      nonce, // sender next nonce
      chainId: status.chainId, // endpoint status.chainId
      epochHeight,

      gas: gasUsed,
      gasPrice,
      storageLimit: storageCollateralized,
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
    from,
    to,
    amount,
    decimals,
    contract,
  }) {
    const fromAddress = accountInfo.address;
    const fromAddressHex = format.hexAddress(fromAddress);
    const toAddressHex = format.hexAddress(to);
    const contractApi = this.chainManager.apiRpc.CRC20(contract);

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

  isValidAddress({ address }) {
    try {
      // TODO
      return true;
      // eslint-disable-next-line no-unreachable
    } catch (ex) {
      return false;
    }
  }

  decodeTransactionData({ address, data }) {
    // noop
  }
}

export default Wallet;
