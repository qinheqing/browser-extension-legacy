import * as BufferLayout from 'buffer-layout';
import bs58 from 'bs58';
import { isBuffer } from 'lodash';
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
    this.connection = new Connection(rpcUrl, this.defaultCommitment);

    // TODO remove
    global.$$chainSOL = this;
  }

  get defaultCommitment() {
    return this.options.defaultCommitment;
  }

  async getRecentBlockHash() {
    const { feeCalculator, blockhash } =
      await this.connection.getRecentBlockhash(this.defaultCommitment);
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
  normalizeAccountInfo(solAccountInfo) {
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
    return await this.connection.sendRawTransaction(rawTransaction, {
      skipPreflight,
      preflightCommitment,
    });
  }

  // solanaWeb3.js create wss realtime push
  addAccountChangeListener(address, handler) {
    // https://solana-labs.github.io/solana-web3.js/modules.html#accountchangecallback
    // TODO normalizeAccountInfo
    return this.connection.onAccountChange(new PublicKey(address), (info) => {
      handler(this.normalizeAccountInfo({ ...info, address }));
    });
  }

  removeAccountChangeListener(id) {
    return this.connection.removeAccountChangeListener(id);
  }

  async getAccountInfo({ address }) {
    /*
     *  {
     *    context: {slot: 81729468}
     *    value: {data: Uint8Array(0), executable:false, lamports:48752, owner: PublicKey, rentEpoch: 201}
     *  }
     */
    const res = await this.connection.getParsedAccountInfo(
      new PublicKey(address),
    );

    /*
    - getParsedAccountInfo:
      const solAccountInfo = res.value
    - getAccountInfo:
      const solAccountInfo = res
     */
    const solAccountInfo = res.value;

    return this.normalizeAccountInfo({
      ...solAccountInfo,
      address,
    });
  }

  async getAccountTokens({ address } = {}) {
    const ownerAddress = address || this.options.accountInfo.address;
    const accountPublicKey = new PublicKey(ownerAddress);
    const filters = helpersSOL.getOwnedAccountsFilters(accountPublicKey);
    // TODO https://solana-labs.github.io/solana-web3.js/classes/connection.html#getparsedtokenaccountsbyowner
    //    getParsedProgramAccounts, getParsedTokenAccountsByOwner
    const resp = await this.connection._rpcRequest('getProgramAccounts', [
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
    const tokens = await Promise.all(
      result.map(async (item) => {
        const { publicKey, accountInfo } = item;
        // get balance, mint from accountInfo.data
        const parsed = helpersSOL.parseTokenAccountData(item.accountInfo.data);
        const associatedAddress = await helpersSOL.findAssociatedTokenAddress(
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
          ...item,
          parsed,
          balance: parsed.amount, // Token account balance
          address: publicKey.toString(), // Token account address
          depositAddress, // Token deposit address
          ownerAddress, // Owner account address which token belongs to
          contractAddress: parsed.mint.toString(), // token contract address (mintAddress) / token real name
          programAddress: accountInfo.owner.toString(), // token program address
          associatedAddress: associatedAddress.toString(), // token associated address
        };
      }),
    );
    return {
      ownerAddress,
      tokens,
    };
  }

  // TODO add new token will cost SOL
  async getAddTokenFee() {
    // https://solana-labs.github.io/solana-web3.js/classes/connection.html#getminimumbalanceforrentexemption
    // tokenAccountCost = async () => {
    //   return this.connection.getMinimumBalanceForRentExemption(
    //     ACCOUNT_LAYOUT.span,
    //   );
    // };
    return 0;
  }
}

export default ChainProvider;
