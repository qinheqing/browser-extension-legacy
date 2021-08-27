import assert from 'assert';
import bs58 from 'bs58';
import {
  Transaction,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import WalletBase from '../../WalletBase';
import ChainManager from './managers/ChainManager';
import HdKeyManager from './managers/HdKeyManager';
import TokenManager from './managers/TokenManager';
import helpersSOL from './utils/helpersSOL';

class Wallet extends WalletBase {
  get optionsDefault() {
    return {
      // https://solana-labs.github.io/solana-web3.js/modules.html#commitment
      defaultCommitment: helpersSOL.COMMITMENT_TYPES.processed, // processed, confirmed, finalized
    };
  }

  chainManager = new ChainManager(this.options);

  hdkeyManager = new HdKeyManager(this.options);

  tokenManager = new TokenManager(this.options);

  async createAddTokenTxObject({ accountInfo, contract }) {
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
    const toAccountInfo = await this.chainManager.getAccountInfo({
      address: to,
    });

    // to address is SOL address, not a token address
    if (!toAccountInfo.isToken) {
      const { tokens } = await this.chainManager.getAccountTokens({
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
      recentBlockhash: (await this.chainManager.getRecentBlockHash()).blockhash,
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
    return this.chainManager.solWeb3Connection.requestAirdrop(
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

  async decodeTransactionData({ address, data }) {
    // throw new Error('Simulate decode tx error');
    // use lazy import, as utilsSolTransactions includes huge logic and data
    const utilsSolTransactions = await import('./utils/utilsSolTransactions');
    const txBuffer = bs58.decode(data);
    return utilsSolTransactions.decodeSolTransactionMessage(
      this.chainManager.solWeb3Connection,
      {
        publicKey: new PublicKey(address),
      },
      txBuffer,
    );
  }
}

export default Wallet;
