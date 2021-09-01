import assert from 'assert';
import bs58 from 'bs58';
import { isBuffer, uniqBy, isNil } from 'lodash';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import ChainManagerBase from '../../../ChainManagerBase';
import utilsApp from '../../../../utils/utilsApp';
import OneAccountInfo from '../../../../classes/OneAccountInfo';
import helpersSOL from '../utils/helpersSOL';
// https://solana-labs.github.io/solana-web3.js

class ChainManager extends ChainManagerBase {
  constructor(options) {
    super(options);
    this.options = options;

    // https://solana-labs.github.io/solana-web3.js/classes/connection.html#constructor
    this.solWeb3Connection = this.apiRpc;

    // TODO remove
    global.$$chainSOL = this;
  }

  createApiRpc({ url }) {
    // const rpcUrl = clusterApiUrl('testnet');
    return new Connection(url, this.defaultCommitment);
  }

  createApiExplorer() {
    return null;
  }

  get defaultCommitment() {
    return this.options.defaultCommitment;
  }

  async getRecentBlockHash() {
    const { feeCalculator, blockhash } =
      await this.solWeb3Connection.getRecentBlockhash(this.defaultCommitment);
    return {
      feeCalculator,
      blockhash,
    };
  }

  isTokenAddress(owner) {
    return owner && owner.equals(helpersSOL.TOKEN_PROGRAM_ID);
  }

  /**
   *
   * @param solAccountInfo
   *      {address, data: Uint8Array(0), executable:false, lamports:48752, owner: PublicKey, rentEpoch: 201}
   * @return {OneAccountInfo}
   */
  normalizeAccountUpdatesInfo(solAccountInfo) {
    const isToken = this.isTokenAddress(solAccountInfo.owner);
    let balance = solAccountInfo?.lamports;
    let decimals = 0;
    if (isToken) {
      const tokenAmountInfo = solAccountInfo?.data?.parsed?.info?.tokenAmount;
      if (tokenAmountInfo) {
        balance = tokenAmountInfo.amount;
        decimals = tokenAmountInfo.decimals;
      } else {
        const tokenParsedInfo = helpersSOL.parseTokenAccountData(
          solAccountInfo?.data,
        );
        balance = tokenParsedInfo.amount;
        console.log('tokenParsedInfo', tokenParsedInfo);
      }
    } else {
      decimals = this.options.chainInfo.nativeToken.decimals;
      // TODO replace to this.options.chainInfo.nativeToken.decimals
      // decimals = this.options.balanceDecimals;
      assert(
        !isNil(decimals),
        'chainInfo.nativeToken.decimals is not defined.',
      );
    }
    // TODO rename to BalanceInfo or AccountUpdatesInfo
    // { data: Uint8Array(0), executable: false, lamports: 2997561, owner: PublicKey, rentEpoch: 201 }
    return new OneAccountInfo({
      _raw: solAccountInfo,
      address: solAccountInfo.address,
      balance,
      decimals,
      isToken,
    });
  }

  async sendTransaction({
    rawTransaction,
    // false: will make simulation transaction first, fallback if error, need rpc stability
    // true:  will send transaction directly even if error occurs, more fast but will cost fee if error
    skipPreflight = false,
    preflightCommitment = 'single',
  }) {
    return await this.solWeb3Connection.sendRawTransaction(rawTransaction, {
      skipPreflight,
      preflightCommitment,
    });
  }

  // solanaWeb3.js create wss realtime push
  addAccountChangeListener(address, handler) {
    // https://solana-labs.github.io/solana-web3.js/modules.html#accountchangecallback
    // TODO normalizeAccountInfo
    return this.solWeb3Connection.onAccountChange(
      new PublicKey(address),
      (info) => {
        handler(this.normalizeAccountUpdatesInfo({ ...info, address }));
      },
    );
  }

  removeAccountChangeListener(id) {
    return this.solWeb3Connection.removeAccountChangeListener(id);
  }

  async getAccountInfo({ address }) {
    /*
     *  {
     *    context: {slot: 81729468}
     *    value: {data: Uint8Array(0), executable:false, lamports:48752, owner: PublicKey, rentEpoch: 201}
     *  }
     */
    const res = await this.solWeb3Connection.getParsedAccountInfo(
      new PublicKey(address),
    );

    /*
    - getParsedAccountInfo:
        const solAccountInfo = res.value;
    - getAccountInfo:
        const solAccountInfo = res;
     */
    const solAccountInfo = res.value;

    return this.normalizeAccountUpdatesInfo({
      ...solAccountInfo,
      address,
    });
  }

  filterTokensOnlyCreated(tokens) {
    let _tokens = tokens;
    // only display created token account (if both includes associate token account and created token account )
    const createdTokenContractAddress = _tokens
      .filter((t) => !t.isAssociatedToken)
      .map((t) => t.contractAddress);

    if (createdTokenContractAddress.length) {
      _tokens = _tokens.filter(
        (t) =>
          !(
            t.isAssociatedToken &&
            createdTokenContractAddress.includes(t.contractAddress)
          ),
      );
    }
    return _tokens;
  }

  filterTokensOnlyATA(tokens) {
    return tokens.filter((t) => t.isAssociatedToken);
  }

  async getAccountTokens({ address } = {}) {
    const chainKey = this.options.chainInfo.key;
    const ownerAddress = address || this.options?.accountInfo?.address;
    if (!ownerAddress) {
      return {
        chainKey,
        ownerAddress,
        tokens: [],
      };
    }
    const accountPublicKey = new PublicKey(ownerAddress);

    const programId = helpersSOL.TOKEN_PROGRAM_ID;
    const resp = await this.solWeb3Connection.getParsedTokenAccountsByOwner(
      accountPublicKey,
      {
        programId,
      },
    );
    const results = resp.value || [];

    let tokens = await Promise.all(
      results.map(async (item) => {
        const publicKey = item.pubkey;
        // get balance, mint from accountInfo.data
        const parsedInfo = item?.account?.data?.parsed?.info;
        const { tokenAmount } = parsedInfo;
        const mint = new PublicKey(parsedInfo.mint);
        const associatedAddress =
          await helpersSOL.generateAssociatedTokenAddress(
            accountPublicKey,
            mint,
            publicKey,
          );

        const _address = publicKey.toString();
        const depositAddress = ownerAddress;

        // TODO replace to new OneTokenInfo().toJS()
        return {
          platformId: this.options.chainInfo.platformId,
          chainKey,
          ownerAddress, // Owner account address which token belongs to ( native token address )
          balance: tokenAmount.amount, // Token account balance
          decimals: tokenAmount.decimals,
          address: _address, // Token account address ( actual depositAddress )
          depositAddress, // Token deposit address ( depositAddress in UI )
          contractAddress: mint.toString(), // token contract address (mintAddress) / token real name
          programAddress: programId.toString(), // token program address
          associatedAddress: associatedAddress.toString(), // token associated address
          isAssociatedToken: publicKey.equals(associatedAddress),
        };
      }),
    );

    // tokens = this.filterTokensOnlyCreated(tokens);
    tokens = this.filterTokensOnlyATA(tokens);

    return {
      chainKey,
      ownerAddress,
      tokens,
    };
  }

  async getAddAssociateTokenFee() {
    // https://solana-labs.github.io/solana-web3.js/classes/connection.html#getminimumbalanceforrentexemption
    const fee = await this.solWeb3Connection.getMinimumBalanceForRentExemption(
      helpersSOL.ACCOUNT_LAYOUT.span,
    );
    return fee;
  }

  async getTransactionFee() {
    // { blockhash,feeCalculator }
    const res = await this.solWeb3Connection.getRecentBlockhash();
    return res?.feeCalculator?.lamportsPerSignature;
  }

  async getTxHistory({ address, limit = 15 }) {
    const pubKey = new PublicKey(address);
    const commitment = helpersSOL.COMMITMENT_TYPES.confirmed;

    const res = await this.solWeb3Connection.getConfirmedSignaturesForAddress2(
      pubKey,
      {
        before: undefined,
        until: undefined,
        limit,
      },
      commitment,
    );

    /*
     [
        {
          blockTime: 1625274700
          confirmationStatus: "finalized"
          err: null
          memo: null
          signature: "JFu6bBKtDkc68yHa5TQkbGVWW4EDMnJ8tXLEp1mMaShdfuUj1365bRw46A8auejikpALj3WEE18nhDGrT5ubCQw"
          slot: 84065904
        }
      ]
     */
    const signatures = res.map((sig) => sig.signature);
    return this.getTransactions({ ids: signatures });
  }

  async getTransactions({ ids = [] }) {
    const commitment = helpersSOL.COMMITMENT_TYPES.confirmed;

    const items = await this.solWeb3Connection.getParsedConfirmedTransactions(
      ids,
      commitment,
    );
    return {
      items,
    };
  }

  // getEpochInfo
  async getLatestBlock() {
    console.log('getEpochInfo');
  }

  async confirmTransaction({ txid }) {
    const commitment = helpersSOL.COMMITMENT_TYPES.confirmed;

    const res = await this.solWeb3Connection.confirmTransaction(
      txid,
      commitment,
    );
    return res;
  }
}

export default ChainManager;
