import * as BufferLayout from 'buffer-layout';
import bs58 from 'bs58';
import ChainProviderBase from '../../ChainProviderBase';
import utilsApp from '../../../utils/utilsApp';
import OneAccountInfo from '../../../classes/OneAccountInfo';
import helpersSOL from './helpersSOL';

// https://solana-labs.github.io/solana-web3.js
const { Connection, clusterApiUrl, PublicKey } = global.solanaWeb3;

class ChainProvider extends ChainProviderBase {
  constructor(options) {
    super(options);

    // const rpcUrl = clusterApiUrl('testnet');
    const rpcUrl = options?.chainInfo?.rpc?.[0];

    // https://solana-labs.github.io/solana-web3.js/classes/connection.html#constructor
    this.connection = new Connection(rpcUrl, this.defaultCommitment);

    // TODO remove
    global.$$chainSOL = this;
  }

  // https://solana-labs.github.io/solana-web3.js/modules.html#commitment
  defaultCommitment = 'finalized';

  async getRecentBlockHash() {
    const { feeCalculator, blockhash } =
      await this.connection.getRecentBlockhash(this.defaultCommitment);
    return {
      feeCalculator,
      blockhash,
    };
  }

  /**
   *
   * @param solAccountInfo
   *      {data: Uint8Array(0), executable:false, lamports:48752, owner: PublicKey, rentEpoch: 201}
   * @return {OneAccountInfo}
   */
  normalizeAccountInfo(solAccountInfo) {
    const balance = solAccountInfo?.lamports;
    // { data: Uint8Array(0), executable: false, lamports: 2997561, owner: PublicKey, rentEpoch: 201 }
    return new OneAccountInfo({
      balance,
      decimals: this.options.balanceDecimals, // TODO token decimals should be read from chain
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
    return this.connection.onAccountChange(new PublicKey(address), handler);
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
    return this.normalizeAccountInfo(res.value);
  }

  async getAccountTokens({ address }) {
    const accountPublicKey = new PublicKey(address);
    const filters = helpersSOL.getOwnedAccountsFilters(accountPublicKey);
    const resp = await this.connection._rpcRequest('getProgramAccounts', [
      helpersSOL.TOKEN_PROGRAM_ID.toBase58(),
      {
        commitment: this.connection.commitment,
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
    return await Promise.all(
      result.map(async (item) => {
        const { publicKey, accountInfo } = item;
        const parsed = helpersSOL.parseTokenAccountData(item.accountInfo.data);
        const associatedAddress = await helpersSOL.findAssociatedTokenAddress(
          accountPublicKey,
          parsed.mint,
          publicKey,
        );
        const depositAddress = associatedAddress.equals(publicKey)
          ? address
          : publicKey.toString();

        return {
          ...item,
          parsed,
          balance: parsed.amount, // Token balance
          address: publicKey.toString(), // Token address
          depositAddress, // Token deposit address
          accountAddress: address, // account address that token belongs to
          contractAddress: parsed.mint.toString(), // token contract address
          programAddress: accountInfo.owner.toString(), // token program address
          associatedAddress: associatedAddress.toString(), // token  associated address
        };
      }),
    );
  }
}

export default ChainProvider;
