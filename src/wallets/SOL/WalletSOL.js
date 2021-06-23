import bs58 from 'bs58';
import { isNil } from 'lodash';
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

  async addAssociateToken({ account, contract }) {
    const creatorAccount = account || this.accountInfo;
    const ix = OneTxInstructionInfo.createTokenAssociateAddIx({
      creator: creatorAccount.address,
      contract,
    });
    const tx = await this.createTx({
      account: creatorAccount,
      instructions: [ix],
    });
    const txid = await this.signAndSendTx(tx);
    return txid;
  }

  async transfer({
    account,
    from,
    to,
    amount,
    decimals,
    contract,
    isToken = false,
  }) {
    // TODO accountName: feePayer, signer, creator
    const creatorAccount = account || this.accountInfo;
    // const { decimals, mint } = balanceInfo;
    const _decimals = isNil(decimals) ? this.options.balanceDecimals : decimals;
    // decimals convert
    // TODO bignumber
    const _amount = Math.round(parseFloat(amount) * 10 ** _decimals);
    const _from = from || creatorAccount.address;

    console.log('SOL transfer', {
      creatorAccount,
      _from,
      to,
      _amount,
      _decimals,
      contract,
      isToken,
    });

    let ix = null;
    if (isToken) {
      ix = OneTxInstructionInfo.createTokenTransferIx({
        from: _from,
        to,
        amount: _amount,
        decimals: _decimals,
        contract,
        creator: creatorAccount.address,
      });
    } else {
      ix = OneTxInstructionInfo.createTransferIx({
        from: _from,
        to,
        amount: _amount,
      });
    }
    const tx = await this.createTx({
      account: creatorAccount,
      instructions: [ix],
    });

    const txid = await this.signAndSendTx(tx);
    return txid;
  }

  async createTx({ account, instructions = [] }) {
    const _instructions = [].concat(instructions);
    return new OneTransactionInfo({
      // TODO creator,creatorHdPath change to account
      creatorAddress: account.address,
      creatorHdPath: account.path,
      // must be a recent hash e.g. 5min, otherwise throw error:
      //     failed to send transaction: Transaction simulation failed: Blockhash not found
      // recentBlockhash: 'EBqHQq1gHhem3Ruebu9TfbfmiWzifJ1d9YeAY3cyzt7Y',
      recentBlockhash: (await this.chainProvider.getRecentBlockHash())
        .blockhash,
      instructions: _instructions,
    });
  }

  async signAndSendTx(tx) {
    const res = await this.signTx(tx);
    console.log('sign success', res.rawTx, tx);

    const txid = await this.sendTx(res.rawTx);

    console.log(
      `SOL Transfer success:
      https://explorer.solana.com/address/${tx.creatorAddress}?cluster=testnet
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
