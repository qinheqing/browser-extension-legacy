import assert from 'assert';
import WalletBase from '../../WalletBase';
import utilsApp from '../../../utils/utilsApp';
import ChainManager from './managers/ChainManager';
import HdKeyManager from './managers/HdKeyManager';
import TokenManager from './managers/TokenManager';

class Wallet extends WalletBase {
  get optionsDefault() {
    return {};
  }

  chainManager = new ChainManager(this.options);

  hdkeyManager = new HdKeyManager(this.options);

  tokenManager = new TokenManager(this.options);

  // create tx from ix array
  async _createTxObject({ accountInfo, instructions = [] }) {
    // const tx = utilsApp.throwToBeImplemented(this);
    const tx = instructions[0];
    return tx;
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
    let createTokenIx = null;
    const toAccountInfo = await this.chainManager.getAccountInfo({
      address: to,
    });

    if (!toAccountInfo.isToken) {
      const { tokens } = await this.chainManager.getAccountTokens({
        address: to,
      });
      const matchToken = tokens.find((t) => t.contractAddress === contract);
      if (matchToken) {
        // eslint-disable-next-line no-param-reassign
        to = matchToken.address;
      } else {
        createTokenIx = 'ix';
        // eslint-disable-next-line no-param-reassign
        to = 'address';
      }
    }
    const transferIx = 'ix';
    return this._createTxObject({
      accountInfo,
      instructions: [createTokenIx, transferIx].filter(Boolean),
    });
  }

  async createTransferTxObject({ accountInfo, to, amount }) {
    // const transferIx = utilsApp.throwToBeImplemented(this);
    const rpc = this.chainManager.apiRpc;

    // TODO batch rpc call
    const estimate = await rpc.estimateGasAndCollateral({
      to,
      value: amount,
    });
    const { gasLimit, gasUsed, storageCollateralized } = estimate;
    const status = await rpc.getStatus();
    const nonce = await rpc.getNextNonce(accountInfo.address);
    const gasPrice = await rpc.getGasPrice();
    const epochHeight = await rpc.getEpochNumber();

    const transferIx = {
      from: accountInfo.address,
      to, // receiver address
      value: amount, // Drip.fromCFX(0.1), // 0.1 CFX = 100000000000000000 Drip
      data: '0x', // or null

      nonce, // sender next nonce
      chainId: status.chainId, // endpoint status.chainId
      epochHeight,

      gas: gasUsed,
      gasPrice,
      storageLimit: storageCollateralized,
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
