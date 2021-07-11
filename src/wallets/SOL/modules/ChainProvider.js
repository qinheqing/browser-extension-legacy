import * as BufferLayout from 'buffer-layout';
import bs58 from 'bs58';
import { isBuffer, uniqBy } from 'lodash';
import ChainProviderBase from '../../ChainProviderBase';
import utilsApp from '../../../utils/utilsApp';
import OneAccountInfo from '../../../classes/OneAccountInfo';
import helpersSOL from './helpersSOL';

// https://solana-labs.github.io/solana-web3.js
const { Connection, clusterApiUrl, PublicKey } = global.solanaWeb3;

class ChainProvider extends ChainProviderBase {
  constructor(options) {
    super(options);
    this.options = options;
    // const rpcUrl = clusterApiUrl('testnet');
    const rpcUrl = options?.chainInfo?.rpc?.[0];

    // https://solana-labs.github.io/solana-web3.js/classes/connection.html#constructor
    this.solWeb3 = new Connection(rpcUrl, this.defaultCommitment);

    // TODO remove
    global.$$chainSOL = this;
  }

  get defaultCommitment() {
    return this.options.defaultCommitment;
  }

  async getRecentBlockHash() {
    const { feeCalculator, blockhash } = await this.solWeb3.getRecentBlockhash(
      this.defaultCommitment,
    );
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
    console.log(
      'normalizeAccountInfo',
      solAccountInfo,
      solAccountInfo?.data?.parsed?.info,
    );
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
      decimals = this.options.balanceDecimals;
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
    skipPreflight = false,
    preflightCommitment = 'single',
  }) {
    return await this.solWeb3.sendRawTransaction(rawTransaction, {
      skipPreflight,
      preflightCommitment,
    });
  }

  // solanaWeb3.js create wss realtime push
  addAccountChangeListener(address, handler) {
    // https://solana-labs.github.io/solana-web3.js/modules.html#accountchangecallback
    // TODO normalizeAccountInfo
    return this.solWeb3.onAccountChange(new PublicKey(address), (info) => {
      handler(this.normalizeAccountUpdatesInfo({ ...info, address }));
    });
  }

  removeAccountChangeListener(id) {
    return this.solWeb3.removeAccountChangeListener(id);
  }

  async getAccountInfo({ address }) {
    /*
     *  {
     *    context: {slot: 81729468}
     *    value: {data: Uint8Array(0), executable:false, lamports:48752, owner: PublicKey, rentEpoch: 201}
     *  }
     */
    const res = await this.solWeb3.getParsedAccountInfo(new PublicKey(address));

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

  // TODO change to web3.getTokenAccountsByOwner
  async getAccountTokens({ address } = {}) {
    const ownerAddress = address || this.options?.accountInfo?.address;
    if (!ownerAddress) {
      return {
        ownerAddress,
        tokens: [],
      };
    }
    const accountPublicKey = new PublicKey(ownerAddress);
    const filters = helpersSOL.getOwnedAccountsFilters(accountPublicKey);
    // TODO https://solana-labs.github.io/solana-web3.js/classes/connection.html#getparsedtokenaccountsbyowner
    //    getParsedProgramAccounts, getParsedTokenAccountsByOwner, getTokenAccountsByOwner(Phantom used)
    const resp = await this.solWeb3._rpcRequest('getProgramAccounts', [
      helpersSOL.TOKEN_PROGRAM_ID.toBase58(),
      {
        commitment: this.defaultCommitment,
        filters,
      },
    ]);
    if (resp.error) {
      throw new Error(
        `failed to get token accounts owned by ${accountPublicKey.toBase58()}: ${
          resp.error.message
        }`,
      );
    }
    const result = resp.result
      .map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
        publicKey: new PublicKey(pubkey),
        accountInfo: {
          data: bs58.decode(data),
          executable,
          owner: new PublicKey(owner),
          lamports,
        },
      }))
      .filter(({ accountInfo }) => {
        // TODO: remove this check once mainnet is updated
        return filters.every((filter) => {
          if (filter.dataSize) {
            return accountInfo.data.length === filter.dataSize;
          } else if (filter.memcmp) {
            const filterBytes = bs58.decode(filter.memcmp.bytes);
            return accountInfo.data
              .slice(
                filter.memcmp.offset,
                filter.memcmp.offset + filterBytes.length,
              )
              .equals(filterBytes);
          }
          return false;
        });
      });
    let tokens = await Promise.all(
      result.map(async (item) => {
        const { publicKey, accountInfo } = item;
        // get balance, mint from accountInfo.data
        const parsed = helpersSOL.parseTokenAccountData(item.accountInfo.data);
        const associatedAddress =
          await helpersSOL.generateAssociatedTokenAddress(
            accountPublicKey,
            parsed.mint,
            publicKey,
          );

        // DO NOT use ownerAddress as token deposit address, it should be support by the wallet sender code
        //    the sender code will find token real address from owner address from chain
        /*  const depositAddress = associatedAddress.equals(publicKey)
          ? ownerAddress
          : publicKey.toString();
        */
        const depositAddress = publicKey.toString();

        return {
          chainKey: this.options.chainInfo.key,
          balance: parsed.amount, // Token account balance
          address: publicKey.toString(), // Token account address
          depositAddress, // Token deposit address
          ownerAddress, // Owner account address which token belongs to
          contractAddress: parsed.mint.toString(), // token contract address (mintAddress) / token real name
          programAddress: accountInfo.owner.toString(), // token program address
          associatedAddress: associatedAddress.toString(), // token associated address
          isAssociatedToken: publicKey.equals(associatedAddress),
        };
      }),
    );

    // only display created token account (if associate token includes)
    const createdTokenContractAddress = tokens
      .filter((t) => !t.isAssociatedToken)
      .map((t) => t.contractAddress);
    if (createdTokenContractAddress.length) {
      tokens = tokens.filter(
        (t) =>
          !(
            t.isAssociatedToken &&
            createdTokenContractAddress.includes(t.contractAddress)
          ),
      );
    }

    return {
      ownerAddress,
      tokens,
    };
  }

  async getTokenAssociateFee() {
    // https://solana-labs.github.io/solana-web3.js/classes/connection.html#getminimumbalanceforrentexemption
    const fee = await this.solWeb3.getMinimumBalanceForRentExemption(
      helpersSOL.ACCOUNT_LAYOUT.span,
    );
    return fee;
  }

  async getTransactionFee() {
    // { blockhash,feeCalculator }
    const res = await this.solWeb3.getRecentBlockhash();
    return res?.feeCalculator?.lamportsPerSignature;
  }

  async getTxHistory({ address }) {
    const pubKey = new PublicKey(address);
    const commitment = helpersSOL.COMMITMENT_TYPES.confirmed;

    const res = await this.solWeb3.getConfirmedSignaturesForAddress2(
      pubKey,
      {
        before: undefined,
        until: undefined,
        limit: 15,
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

    const items = await this.solWeb3.getParsedConfirmedTransactions(
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

    const res = await this.solWeb3.confirmTransaction(txid, commitment);
    return res;
  }
}

export default ChainProvider;
