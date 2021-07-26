import assert from 'assert';
import bs58 from 'bs58';
import {
  Transaction,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from 'vendors/solanaWeb3';
import WalletBase from '../WalletBase';
import { CONST_CHAIN_KEYS } from '../../consts/consts';
import connectMockSOL from '../../utils/connectMockSOL';
import utilsApp from '../../utils/utilsApp';
import ChainProvider from './modules/ChainProvider';
import HardwareProvider from './modules/HardwareProvider';
import HdKeyProvider from './modules/HdKeyProvider';
import KeyringSOL from './KeyringSOL';
import helpersSOL from './modules/helpersSOL';
import TokenController from './modules/TokenController';
import { decodeSolTransactionMessage } from './utils/utilsTransactionsSOL';
// TODO remove
global.$$connectMockSOL = connectMockSOL;

class WalletSOL extends WalletBase {
  get hdCoin() {
    return CONST_CHAIN_KEYS.SOL;
  }

  get optionsDefault() {
    return {
      // TODO move to chainInfo
      // https://solana-labs.github.io/solana-web3.js/modules.html#commitment
      defaultCommitment: helpersSOL.COMMITMENT_TYPES.processed, // processed, confirmed, finalized
      balanceDecimals: 9,
      hdPathTemplate: `m/44'/501'/{{index}}'/0'`,
    };
  }

  // TODO pass this (wallet instance) instead options to constructor
  hardwareProvider = new HardwareProvider(this.options);

  chainProvider = new ChainProvider(this.options);

  hdkeyProvider = new HdKeyProvider(this.options);

  keyring = new KeyringSOL(this.options);

  tokenController = new TokenController(this.options);

  async createAddAssociateTokenTxObject({ accountInfo, contract }) {
    const ix = await helpersSOL.createAssociatedTokenIxAsync({
      creatorAddress: new PublicKey(accountInfo.address),
      accountAddress: new PublicKey(accountInfo.address),
      mintAddress: new PublicKey(contract),
    });
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
    const toAccountInfo = await this.chainProvider.getAccountInfo({
      address: to,
    });

    // to address is SOL address, not a token address
    if (!toAccountInfo.isToken) {
      const { tokens } = await this.chainProvider.getAccountTokens({
        address: to,
      });
      const matchToken = tokens.find((t) => t.contractAddress === contract);
      if (matchToken) {
        // eslint-disable-next-line no-param-reassign
        to = matchToken.address;
      } else {
        // TODO add createATATokenFee display in UI
        createTokenIx = await helpersSOL.createAssociatedTokenIxAsync({
          creatorAddress: new PublicKey(accountInfo.address),
          accountAddress: new PublicKey(to),
          mintAddress: new PublicKey(contract),
        });
        // eslint-disable-next-line no-param-reassign
        to = (
          await helpersSOL.generateAssociatedTokenAddress(
            new PublicKey(to),
            new PublicKey(contract),
          )
        ).toString();
      }
    }

    const keys = [
      { pubkey: new PublicKey(from), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(contract), isSigner: false, isWritable: false },
      { pubkey: new PublicKey(to), isSigner: false, isWritable: true },
      {
        pubkey: new PublicKey(accountInfo.address),
        isSigner: true,
        isWritable: false,
      },
    ];
    const ix = new TransactionInstruction({
      keys,
      data: helpersSOL.encodeTokenInstructionData({
        transferChecked: { amount, decimals },
      }),
      programId: helpersSOL.TOKEN_PROGRAM_ID,
    });
    return this._createTxObject({
      accountInfo,
      instructions: [createTokenIx, ix].filter((item) => Boolean(item)),
    });
  }

  async createTransferTxObject({ accountInfo, to, amount }) {
    const ix = SystemProgram.transfer({
      fromPubkey: new PublicKey(accountInfo.address),
      toPubkey: new PublicKey(to),
      lamports: amount,
    });

    return this._createTxObject({
      accountInfo,
      instructions: [ix],
    });
  }

  async _createTxObject({ accountInfo, instructions = [] }) {
    const tx = new Transaction({
      feePayer: new PublicKey(accountInfo.address),
      recentBlockhash: (await this.chainProvider.getRecentBlockHash())
        .blockhash,
      instructions,
    });
    return tx;
  }

  async signAndSendTxObject({ accountInfo, tx }) {
    const txStr = bs58.encode(tx.serializeMessage());
    const signStr = await this.signTx(txStr);

    const signBytes = bs58.decode(signStr);
    const publicKey = new PublicKey(accountInfo.address);

    tx.addSignature(publicKey, signBytes);

    const rawTx = tx.serialize();
    const txid = await this.sendTx(rawTx);
    return txid;
  }

  async requestAirdrop() {
    const address = new PublicKey(this.accountInfo.address);
    return this.chainProvider.solWeb3Connection.requestAirdrop(
      address,
      LAMPORTS_PER_SOL,
    );
  }

  isValidAddress({ address }) {
    try {
      const pubKey = new PublicKey(address);
      return true;
    } catch (ex) {
      return false;
    }
  }

  getBlockBrowserLink({ tx, account, token, block }) {
    const { chainInfo } = this.options;
    const browserLinks = chainInfo?.browser?.[0];

    assert(browserLinks, 'chainInfo.browser NOT exists');
    assert(browserLinks.tx, 'chainInfo.browser.tx NOT exists');
    assert(browserLinks.account, 'chainInfo.browser.account NOT exists');
    assert(browserLinks.token, 'chainInfo.browser.token NOT exists');
    assert(browserLinks.block, 'chainInfo.browser.block NOT exists');
    assert(browserLinks.home, 'chainInfo.browser.home NOT exists');

    if (tx) {
      return utilsApp.formatTemplate(browserLinks.tx, { tx });
    }
    if (account) {
      return utilsApp.formatTemplate(browserLinks.account, { account });
    }
    if (token) {
      return utilsApp.formatTemplate(browserLinks.token, { token });
    }
    if (block) {
      return utilsApp.formatTemplate(browserLinks.block, { block });
    }
    return browserLinks.home || utilsApp.throwToBeImplemented(this);
  }

  async decodeTransactionData({ address, data }) {
    const txBuffer = bs58.decode(data);
    return decodeSolTransactionMessage(
      this.chainProvider.solWeb3Connection,
      new PublicKey(address),
      txBuffer,
    );
  }
}

export default WalletSOL;
