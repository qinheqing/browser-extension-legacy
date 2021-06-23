import bs58 from 'bs58';
import WalletBase from '../WalletBase';
import { CONST_CHAIN_KEYS, CONST_TX_TYPES } from '../../consts/consts';
import OneTransactionInfo from '../../classes/OneTransactionInfo';
import connectMockSOL from '../../utils/connectMockSOL';
import OneTxInstructionInfo from '../../classes/OneTxInstructionInfo';
import ChainProvider from './modules/ChainProvider';
import HardwareProvider from './modules/HardwareProvider';
import HdKeyProvider from './modules/HdKeyProvider';

// TODO remove
global.$$connectMockSOL = connectMockSOL;

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

  publicKeyToAddress({ publicKey }) {
    const publicKeyBytes = Buffer.from(publicKey, 'hex');
    const publicKeyBs58 = bs58.encode(publicKeyBytes);
    console.log('WalletSol.publicKeyToAddress', {
      publicKeyBytes,
      publicKey,
      publicKeyBs58,
    });
    const solAddress = new global.solanaWeb3.PublicKey(publicKeyBs58);
    console.log({
      publicKeyBs58,
      solAddress,
      solAddress1: solAddress.toString(),
      solAddress2: solAddress.toString('hex'),
      isSame: solAddress.toString() === publicKeyBs58,
    });
    return `${solAddress.toString('hex')}`;
  }

  async transfer({ account, to, amount }) {
    // TODO accountName: feePayer, signer, creator
    const creatorAccount = account || this.accountInfo;
    console.log('SOL transfer', { creatorAccount, to, amount });
    // const { decimals, mint } = balanceInfo;
    const decimals = this.options.balanceDecimals;
    // decimals convert
    const $amount = Math.round(parseFloat(amount) * 10 ** decimals);

    const transferTx = new OneTransactionInfo({
      // TODO creator,creatorHdPath change to account
      creatorAddress: creatorAccount.address,
      creatorHdPath: creatorAccount.path,
      // must be a recent hash e.g. 5min, otherwise throw error:
      //     failed to send transaction: Transaction simulation failed: Blockhash not found
      // recentBlockhash: 'EBqHQq1gHhem3Ruebu9TfbfmiWzifJ1d9YeAY3cyzt7Y',
      recentBlockhash: (await this.chainProvider.getRecentBlockHash())
        .blockhash,
      instructions: [
        new OneTxInstructionInfo.Transfer({
          from: creatorAccount.address,
          to,
          amount: $amount,
        }),
      ],
    });
    const res = await this.signTx(transferTx);
    console.log('sign success', res.rawTx, transferTx);

    const txid = await this.sendTx(res.rawTx);
    console.log(
      `SOL Transfer success:
      https://explorer.solana.com/address/${creatorAccount.address}?cluster=testnet
      https://explorer.solana.com/tx/${txid}?cluster=testnet`,
    );
    return txid;
  }

  async signTx(tx) {
    // if account type is hardware, sign by hardware
    return await connectMockSOL.signTx(tx);
  }

  async sendTx(txSigned) {
    const txid = await this.chainProvider.sendTransaction({
      rawTransaction: txSigned,
    });
    return txid;
  }
}

export default WalletSOL;
