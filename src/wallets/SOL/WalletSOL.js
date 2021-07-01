import bs58 from 'bs58';
import WalletBase from '../WalletBase';
import { CONST_CHAIN_KEYS } from '../../consts/consts';
import connectMockSOL from '../../utils/connectMockSOL';
import ChainProvider from './modules/ChainProvider';
import HardwareProvider from './modules/HardwareProvider';
import HdKeyProvider from './modules/HdKeyProvider';
import KeyringSOL from './KeyringSOL';
import helpersSOL from './modules/helpersSOL';

// TODO remove
global.$$connectMockSOL = connectMockSOL;
const {
  Transaction,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} = global.solanaWeb3;

class WalletSOL extends WalletBase {
  get hdCoin() {
    return CONST_CHAIN_KEYS.SOL;
  }

  get optionsDefault() {
    return {
      // https://solana-labs.github.io/solana-web3.js/modules.html#commitment
      defaultCommitment: 'confirmed', // processed, confirmed, finalized
      balanceDecimals: 9,
      hdPathTemplate: `m/44'/501'/{{index}}'/0'`,
    };
  }

  // TODO pass this (wallet instance) instead options to constructor
  hardwareProvider = new HardwareProvider(this.options);

  chainProvider = new ChainProvider(this.options);

  hdkeyProvider = new HdKeyProvider(this.options);

  keyring = new KeyringSOL(this.options);

  async createAddAssociateTokenTxObject({ accountInfo, contract }) {
    const ix = await helpersSOL.createAssociatedTokenIxAsync({
      creator: new PublicKey(accountInfo.address),
      contract: new PublicKey(contract),
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
      instructions: [ix],
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
    console.log(
      `SOL Transfer success:
      https://explorer.solana.com/address/${accountInfo.address}?cluster=testnet
      https://explorer.solana.com/tx/${txid}?cluster=testnet`,
    );

    return txid;
  }

  async requestAirdrop() {
    const address = new PublicKey(this.accountInfo.address);
    return this.chainProvider.connection.requestAirdrop(
      address,
      LAMPORTS_PER_SOL,
    );
  }
}

export default WalletSOL;
