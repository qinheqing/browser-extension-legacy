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

  async _createTxObject({ accountInfo, instructions = [] }) {
    const tx = null;
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
    const transferIx = null;

    return this._createTxObject({
      accountInfo,
      instructions: [transferIx],
    });
  }

  async signAndSendTxObject({ accountInfo, tx }) {
    const txStr = '';
    const signStr = await this.signTx(txStr);
    const rawTxSigned = await this.serializeTxObject(tx);
    const txid = await this.sendTx(rawTxSigned);
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
