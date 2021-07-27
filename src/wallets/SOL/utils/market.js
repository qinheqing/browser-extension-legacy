/* eslint-disable no-use-before-define,no-void,no-bitwise */
// @ts-nocheck
// https://github.com/project-serum/serum-ts/blob/master/packages/serum/src/market.ts
import { blob, seq, struct, u8 } from 'buffer-layout';
import BN from 'bn.js';
import {
  Account,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from 'vendors/solanaWeb3';
import { accountFlagsLayout, publicKeyLayout, u128, u64 } from './layouts';
import { SLAB_LAYOUT } from './slab';
import { DexInstructions } from './instructions';
import { decodeEventQueue, decodeRequestQueue } from './queue';
import { getFeeTier, supportsSrmFeeDiscounts } from './fees';
import {
  closeAccount,
  initializeAccount,
  MSRM_DECIMALS,
  MSRM_MINT,
  SRM_DECIMALS,
  SRM_MINT,
  TOKEN_PROGRAM_ID,
  WRAPPED_SOL_MINT,
} from './token-instructions';
import { getLayoutVersion } from './tokens_and_markets';

export const _MARKET_STAT_LAYOUT_V1 = struct([
  blob(5),
  accountFlagsLayout('accountFlags'),
  publicKeyLayout('ownAddress'),
  u64('vaultSignerNonce'),
  publicKeyLayout('baseMint'),
  publicKeyLayout('quoteMint'),
  publicKeyLayout('baseVault'),
  u64('baseDepositsTotal'),
  u64('baseFeesAccrued'),
  publicKeyLayout('quoteVault'),
  u64('quoteDepositsTotal'),
  u64('quoteFeesAccrued'),
  u64('quoteDustThreshold'),
  publicKeyLayout('requestQueue'),
  publicKeyLayout('eventQueue'),
  publicKeyLayout('bids'),
  publicKeyLayout('asks'),
  u64('baseLotSize'),
  u64('quoteLotSize'),
  u64('feeRateBps'),
  blob(7),
]);
export const MARKET_STATE_LAYOUT_V2 = struct([
  blob(5),
  accountFlagsLayout('accountFlags'),
  publicKeyLayout('ownAddress'),
  u64('vaultSignerNonce'),
  publicKeyLayout('baseMint'),
  publicKeyLayout('quoteMint'),
  publicKeyLayout('baseVault'),
  u64('baseDepositsTotal'),
  u64('baseFeesAccrued'),
  publicKeyLayout('quoteVault'),
  u64('quoteDepositsTotal'),
  u64('quoteFeesAccrued'),
  u64('quoteDustThreshold'),
  publicKeyLayout('requestQueue'),
  publicKeyLayout('eventQueue'),
  publicKeyLayout('bids'),
  publicKeyLayout('asks'),
  u64('baseLotSize'),
  u64('quoteLotSize'),
  u64('feeRateBps'),
  u64('referrerRebatesAccrued'),
  blob(7),
]);
export const MARKET_STATE_LAYOUT_V3 = struct([
  blob(5),
  accountFlagsLayout('accountFlags'),
  publicKeyLayout('ownAddress'),
  u64('vaultSignerNonce'),
  publicKeyLayout('baseMint'),
  publicKeyLayout('quoteMint'),
  publicKeyLayout('baseVault'),
  u64('baseDepositsTotal'),
  u64('baseFeesAccrued'),
  publicKeyLayout('quoteVault'),
  u64('quoteDepositsTotal'),
  u64('quoteFeesAccrued'),
  u64('quoteDustThreshold'),
  publicKeyLayout('requestQueue'),
  publicKeyLayout('eventQueue'),
  publicKeyLayout('bids'),
  publicKeyLayout('asks'),
  u64('baseLotSize'),
  u64('quoteLotSize'),
  u64('feeRateBps'),
  u64('referrerRebatesAccrued'),
  publicKeyLayout('authority'),
  publicKeyLayout('pruneAuthority'),
  blob(7),
]);
export class Market {
  constructor(
    decoded,
    baseMintDecimals,
    quoteMintDecimals,
    options = {},
    programId,
    layoutOverride,
  ) {
    const { skipPreflight = false, commitment = 'recent' } = options;
    if (!decoded.accountFlags.initialized || !decoded.accountFlags.market) {
      throw new Error('Invalid market state');
    }
    this._decoded = decoded;
    this._baseSplTokenDecimals = baseMintDecimals;
    this._quoteSplTokenDecimals = quoteMintDecimals;
    this._skipPreflight = skipPreflight;
    this._commitment = commitment;
    this._programId = programId;
    this._openOrdersAccountsCache = {};
    this._feeDiscountKeysCache = {};
    this._layoutOverride = layoutOverride;
  }

  static getLayout(programId) {
    if (getLayoutVersion(programId) === 1) {
      return _MARKET_STAT_LAYOUT_V1;
    }
    return MARKET_STATE_LAYOUT_V2;
  }

  static async findAccountsByMints(
    connection,
    baseMintAddress,
    quoteMintAddress,
    programId,
  ) {
    const filters = [
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf('baseMint'),
          bytes: baseMintAddress.toBase58(),
        },
      },
      {
        memcmp: {
          offset: Market.getLayout(programId).offsetOf('quoteMint'),
          bytes: quoteMintAddress.toBase58(),
        },
      },
    ];
    return getFilteredProgramAccounts(connection, programId, filters);
  }

  static async load(
    connection,
    address,
    options = {},
    programId,
    layoutOverride,
  ) {
    const { owner, data } = throwIfNull(
      await connection.getAccountInfo(address),
      'Market not found',
    );
    if (!owner.equals(programId)) {
      throw new Error(`Address not owned by program: ${owner.toBase58()}`);
    }
    const decoded = (
      layoutOverride !== null && layoutOverride !== void 0
        ? layoutOverride
        : this.getLayout(programId)
    ).decode(data);
    if (
      !decoded.accountFlags.initialized ||
      !decoded.accountFlags.market ||
      !decoded.ownAddress.equals(address)
    ) {
      throw new Error('Invalid market');
    }
    const [baseMintDecimals, quoteMintDecimals] = await Promise.all([
      getMintDecimals(connection, decoded.baseMint),
      getMintDecimals(connection, decoded.quoteMint),
    ]);
    return new Market(
      decoded,
      baseMintDecimals,
      quoteMintDecimals,
      options,
      programId,
      layoutOverride,
    );
  }

  get programId() {
    return this._programId;
  }

  get address() {
    return this._decoded.ownAddress;
  }

  get publicKey() {
    return this.address;
  }

  get baseMintAddress() {
    return this._decoded.baseMint;
  }

  get quoteMintAddress() {
    return this._decoded.quoteMint;
  }

  get bidsAddress() {
    return this._decoded.bids;
  }

  get asksAddress() {
    return this._decoded.asks;
  }

  get decoded() {
    return this._decoded;
  }

  async loadBids(connection) {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.bids),
    );
    return Orderbook.decode(this, data);
  }

  async loadAsks(connection) {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.asks),
    );
    return Orderbook.decode(this, data);
  }

  async loadOrdersForOwner(connection, ownerAddress, cacheDurationMs = 0) {
    const [bids, asks, openOrdersAccounts] = await Promise.all([
      this.loadBids(connection),
      this.loadAsks(connection),
      this.findOpenOrdersAccountsForOwner(
        connection,
        ownerAddress,
        cacheDurationMs,
      ),
    ]);
    return this.filterForOpenOrders(bids, asks, openOrdersAccounts);
  }

  filterForOpenOrders(bids, asks, openOrdersAccounts) {
    return [...bids, ...asks].filter((order) =>
      openOrdersAccounts.some((openOrders) =>
        order.openOrdersAddress.equals(openOrders.address),
      ),
    );
  }

  async findBaseTokenAccountsForOwner(
    connection,
    ownerAddress,
    includeUnwrappedSol = false,
  ) {
    if (this.baseMintAddress.equals(WRAPPED_SOL_MINT) && includeUnwrappedSol) {
      const [wrapped, unwrapped] = await Promise.all([
        this.findBaseTokenAccountsForOwner(connection, ownerAddress, false),
        connection.getAccountInfo(ownerAddress),
      ]);
      if (unwrapped !== null) {
        return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
      }
      return wrapped;
    }
    return await this.getTokenAccountsByOwnerForMint(
      connection,
      ownerAddress,
      this.baseMintAddress,
    );
  }

  async getTokenAccountsByOwnerForMint(connection, ownerAddress, mintAddress) {
    return (
      await connection.getTokenAccountsByOwner(ownerAddress, {
        mint: mintAddress,
      })
    ).value;
  }

  async findQuoteTokenAccountsForOwner(
    connection,
    ownerAddress,
    includeUnwrappedSol = false,
  ) {
    if (this.quoteMintAddress.equals(WRAPPED_SOL_MINT) && includeUnwrappedSol) {
      const [wrapped, unwrapped] = await Promise.all([
        this.findQuoteTokenAccountsForOwner(connection, ownerAddress, false),
        connection.getAccountInfo(ownerAddress),
      ]);
      if (unwrapped !== null) {
        return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
      }
      return wrapped;
    }
    return await this.getTokenAccountsByOwnerForMint(
      connection,
      ownerAddress,
      this.quoteMintAddress,
    );
  }

  async findOpenOrdersAccountsForOwner(
    connection,
    ownerAddress,
    cacheDurationMs = 0,
  ) {
    const strOwner = ownerAddress.toBase58();
    const now = new Date().getTime();
    if (
      strOwner in this._openOrdersAccountsCache &&
      now - this._openOrdersAccountsCache[strOwner].ts < cacheDurationMs
    ) {
      return this._openOrdersAccountsCache[strOwner].accounts;
    }
    const openOrdersAccountsForOwner = await OpenOrders.findForMarketAndOwner(
      connection,
      this.address,
      ownerAddress,
      this._programId,
    );
    this._openOrdersAccountsCache[strOwner] = {
      accounts: openOrdersAccountsForOwner,
      ts: now,
    };
    return openOrdersAccountsForOwner;
  }

  async placeOrder(
    connection,
    {
      owner,
      payer,
      side,
      price,
      size,
      orderType = 'limit',
      clientId,
      openOrdersAddressKey,
      openOrdersAccount,
      feeDiscountPubkey,
    },
  ) {
    const { transaction, signers } = await this.makePlaceOrderTransaction(
      connection,
      {
        owner,
        payer,
        side,
        price,
        size,
        orderType,
        clientId,
        openOrdersAddressKey,
        openOrdersAccount,
        feeDiscountPubkey,
      },
    );
    return await this._sendTransaction(connection, transaction, [
      owner,
      ...signers,
    ]);
  }

  getSplTokenBalanceFromAccountInfo(accountInfo, decimals) {
    return divideBnToNumber(
      new BN(accountInfo.data.slice(64, 72), 10, 'le'),
      new BN(10).pow(new BN(decimals)),
    );
  }

  get supportsSrmFeeDiscounts() {
    return supportsSrmFeeDiscounts(this._programId);
  }

  get supportsReferralFees() {
    return getLayoutVersion(this._programId) > 1;
  }

  get usesRequestQueue() {
    return getLayoutVersion(this._programId) <= 2;
  }

  async findFeeDiscountKeys(connection, ownerAddress, cacheDurationMs = 0) {
    let sortedAccounts = [];
    const now = new Date().getTime();
    const strOwner = ownerAddress.toBase58();
    if (
      strOwner in this._feeDiscountKeysCache &&
      now - this._feeDiscountKeysCache[strOwner].ts < cacheDurationMs
    ) {
      return this._feeDiscountKeysCache[strOwner].accounts;
    }
    if (this.supportsSrmFeeDiscounts) {
      // Fee discounts based on (M)SRM holdings supported in newer versions
      const msrmAccounts = (
        await this.getTokenAccountsByOwnerForMint(
          connection,
          ownerAddress,
          MSRM_MINT,
        )
      ).map(({ pubkey, account }) => {
        const balance = this.getSplTokenBalanceFromAccountInfo(
          account,
          MSRM_DECIMALS,
        );
        return {
          pubkey,
          mint: MSRM_MINT,
          balance,
          feeTier: getFeeTier(balance, 0),
        };
      });
      const srmAccounts = (
        await this.getTokenAccountsByOwnerForMint(
          connection,
          ownerAddress,
          SRM_MINT,
        )
      ).map(({ pubkey, account }) => {
        const balance = this.getSplTokenBalanceFromAccountInfo(
          account,
          SRM_DECIMALS,
        );
        return {
          pubkey,
          mint: SRM_MINT,
          balance,
          feeTier: getFeeTier(0, balance),
        };
      });
      sortedAccounts = msrmAccounts.concat(srmAccounts).sort((a, b) => {
        if (a.feeTier > b.feeTier) {
          return -1;
        } else if (a.feeTier < b.feeTier) {
          return 1;
        }

        if (a.balance > b.balance) {
          return -1;
        } else if (a.balance < b.balance) {
          return 1;
        }

        return 0;
      });
    }
    this._feeDiscountKeysCache[strOwner] = {
      accounts: sortedAccounts,
      ts: now,
    };
    return sortedAccounts;
  }

  async findBestFeeDiscountKey(
    connection,
    ownerAddress,
    cacheDurationMs = 30000,
  ) {
    const accounts = await this.findFeeDiscountKeys(
      connection,
      ownerAddress,
      cacheDurationMs,
    );
    if (accounts.length > 0) {
      return {
        pubkey: accounts[0].pubkey,
        feeTier: accounts[0].feeTier,
      };
    }
    return {
      pubkey: null,
      feeTier: 0,
    };
  }

  async makePlaceOrderTransaction(
    connection,
    {
      owner,
      payer,
      side,
      price,
      size,
      orderType = 'limit',
      clientId,
      openOrdersAddressKey,
      openOrdersAccount,
      feeDiscountPubkey = undefined,
      selfTradeBehavior = 'decrementTake',
    },
    cacheDurationMs = 0,
    feeDiscountPubkeyCacheDurationMs = 0,
  ) {
    let _a, _b;
    // @ts-ignore
    const ownerAddress =
      (_a = owner.publicKey) !== null && _a !== void 0 ? _a : owner;
    const openOrdersAccounts = await this.findOpenOrdersAccountsForOwner(
      connection,
      ownerAddress,
      cacheDurationMs,
    );
    const transaction = new Transaction();
    const signers = [];
    // Fetch an SRM fee discount key if the market supports discounts and it is not supplied
    let useFeeDiscountPubkey;
    if (feeDiscountPubkey) {
      useFeeDiscountPubkey = feeDiscountPubkey;
    } else if (
      feeDiscountPubkey === undefined &&
      this.supportsSrmFeeDiscounts
    ) {
      useFeeDiscountPubkey = (
        await this.findBestFeeDiscountKey(
          connection,
          ownerAddress,
          feeDiscountPubkeyCacheDurationMs,
        )
      ).pubkey;
    } else {
      useFeeDiscountPubkey = null;
    }
    let openOrdersAddress;
    if (openOrdersAccounts.length === 0) {
      let account;
      if (openOrdersAccount) {
        account = openOrdersAccount;
      } else {
        account = new Account();
      }
      transaction.add(
        await OpenOrders.makeCreateAccountTransaction(
          connection,
          this.address,
          ownerAddress,
          account.publicKey,
          this._programId,
        ),
      );
      openOrdersAddress = account.publicKey;
      signers.push(account);
      // refresh the cache of open order accounts on next fetch
      this._openOrdersAccountsCache[ownerAddress.toBase58()].ts = 0;
    } else if (openOrdersAccount) {
      openOrdersAddress = openOrdersAccount.publicKey;
    } else if (openOrdersAddressKey) {
      openOrdersAddress = openOrdersAddressKey;
    } else {
      openOrdersAddress = openOrdersAccounts[0].address;
    }
    let wrappedSolAccount = null;
    if (payer.equals(ownerAddress)) {
      if (
        (side === 'buy' && this.quoteMintAddress.equals(WRAPPED_SOL_MINT)) ||
        (side === 'sell' && this.baseMintAddress.equals(WRAPPED_SOL_MINT))
      ) {
        wrappedSolAccount = new Account();
        let lamports;
        if (side === 'buy') {
          lamports = Math.round(price * size * 1.01 * LAMPORTS_PER_SOL);
          if (openOrdersAccounts.length > 0) {
            lamports -= openOrdersAccounts[0].quoteTokenFree.toNumber();
          }
        } else {
          lamports = Math.round(size * LAMPORTS_PER_SOL);
          if (openOrdersAccounts.length > 0) {
            lamports -= openOrdersAccounts[0].baseTokenFree.toNumber();
          }
        }
        lamports = Math.max(lamports, 0) + 1e7;
        transaction.add(
          SystemProgram.createAccount({
            fromPubkey: ownerAddress,
            newAccountPubkey: wrappedSolAccount.publicKey,
            lamports,
            space: 165,
            programId: TOKEN_PROGRAM_ID,
          }),
        );
        transaction.add(
          initializeAccount({
            account: wrappedSolAccount.publicKey,
            mint: WRAPPED_SOL_MINT,
            owner: ownerAddress,
          }),
        );
        signers.push(wrappedSolAccount);
      } else {
        throw new Error('Invalid payer account');
      }
    }
    const placeOrderInstruction = this.makePlaceOrderInstruction(connection, {
      owner,
      payer:
        (_b =
          wrappedSolAccount === null || wrappedSolAccount === void 0
            ? void 0
            : wrappedSolAccount.publicKey) !== null && _b !== void 0
          ? _b
          : payer,
      side,
      price,
      size,
      orderType,
      clientId,
      openOrdersAddressKey: openOrdersAddress,
      feeDiscountPubkey: useFeeDiscountPubkey,
      selfTradeBehavior,
    });
    transaction.add(placeOrderInstruction);
    if (wrappedSolAccount) {
      transaction.add(
        closeAccount({
          source: wrappedSolAccount.publicKey,
          destination: ownerAddress,
          owner: ownerAddress,
        }),
      );
    }
    return { transaction, signers, payer: owner };
  }

  makePlaceOrderInstruction(connection, params) {
    let _a;
    const {
      owner,
      payer,
      side,
      price,
      size,
      orderType = 'limit',
      clientId,
      openOrdersAddressKey,
      openOrdersAccount,
      feeDiscountPubkey = null,
    } = params;
    // @ts-ignore
    const ownerAddress =
      (_a = owner.publicKey) !== null && _a !== void 0 ? _a : owner;
    if (this.baseSizeNumberToLots(size).lte(new BN(0))) {
      throw new Error('size too small');
    }
    if (this.priceNumberToLots(price).lte(new BN(0))) {
      throw new Error('invalid price');
    }
    if (this.usesRequestQueue) {
      return DexInstructions.newOrder({
        market: this.address,
        requestQueue: this._decoded.requestQueue,
        baseVault: this._decoded.baseVault,
        quoteVault: this._decoded.quoteVault,
        openOrders: openOrdersAccount
          ? openOrdersAccount.publicKey
          : openOrdersAddressKey,
        owner: ownerAddress,
        payer,
        side,
        limitPrice: this.priceNumberToLots(price),
        maxQuantity: this.baseSizeNumberToLots(size),
        orderType,
        clientId,
        programId: this._programId,
        feeDiscountPubkey: this.supportsSrmFeeDiscounts
          ? feeDiscountPubkey
          : null,
      });
    }

    return this.makeNewOrderV3Instruction(params);
  }

  makeNewOrderV3Instruction(params) {
    let _a;
    const {
      owner,
      payer,
      side,
      price,
      size,
      orderType = 'limit',
      clientId,
      openOrdersAddressKey,
      openOrdersAccount,
      feeDiscountPubkey = null,
      selfTradeBehavior = 'decrementTake',
      programId,
    } = params;
    // @ts-ignore
    const ownerAddress =
      (_a = owner.publicKey) !== null && _a !== void 0 ? _a : owner;
    return DexInstructions.newOrderV3({
      market: this.address,
      bids: this._decoded.bids,
      asks: this._decoded.asks,
      requestQueue: this._decoded.requestQueue,
      eventQueue: this._decoded.eventQueue,
      baseVault: this._decoded.baseVault,
      quoteVault: this._decoded.quoteVault,
      openOrders: openOrdersAccount
        ? openOrdersAccount.publicKey
        : openOrdersAddressKey,
      owner: ownerAddress,
      payer,
      side,
      limitPrice: this.priceNumberToLots(price),
      maxBaseQuantity: this.baseSizeNumberToLots(size),
      maxQuoteQuantity: new BN(this._decoded.quoteLotSize.toNumber()).mul(
        this.baseSizeNumberToLots(size).mul(this.priceNumberToLots(price)),
      ),
      orderType,
      clientId,
      programId:
        programId !== null && programId !== void 0
          ? programId
          : this._programId,
      selfTradeBehavior,
      feeDiscountPubkey: this.supportsSrmFeeDiscounts
        ? feeDiscountPubkey
        : null,
    });
  }

  async _sendTransaction(connection, transaction, signers) {
    const signature = await connection.sendTransaction(transaction, signers, {
      skipPreflight: this._skipPreflight,
    });
    const { value } = await connection.confirmTransaction(
      signature,
      this._commitment,
    );
    if (value === null || value === void 0 ? void 0 : value.err) {
      throw new Error(JSON.stringify(value.err));
    }
    return signature;
  }

  async cancelOrderByClientId(connection, owner, openOrders, clientId) {
    const transaction = await this.makeCancelOrderByClientIdTransaction(
      connection,
      owner.publicKey,
      openOrders,
      clientId,
    );
    return await this._sendTransaction(connection, transaction, [owner]);
  }

  async makeCancelOrderByClientIdTransaction(
    connection,
    owner,
    openOrders,
    clientId,
  ) {
    const transaction = new Transaction();
    if (this.usesRequestQueue) {
      transaction.add(
        DexInstructions.cancelOrderByClientId({
          market: this.address,
          owner,
          openOrders,
          requestQueue: this._decoded.requestQueue,
          clientId,
          programId: this._programId,
        }),
      );
    } else {
      transaction.add(
        DexInstructions.cancelOrderByClientIdV2({
          market: this.address,
          openOrders,
          owner,
          bids: this._decoded.bids,
          asks: this._decoded.asks,
          eventQueue: this._decoded.eventQueue,
          clientId,
          programId: this._programId,
        }),
      );
    }
    return transaction;
  }

  async cancelOrder(connection, owner, order) {
    const transaction = await this.makeCancelOrderTransaction(
      connection,
      owner.publicKey,
      order,
    );
    return await this._sendTransaction(connection, transaction, [owner]);
  }

  async makeCancelOrderTransaction(connection, owner, order) {
    const transaction = new Transaction();
    transaction.add(this.makeCancelOrderInstruction(connection, owner, order));
    return transaction;
  }

  makeCancelOrderInstruction(connection, owner, order) {
    if (this.usesRequestQueue) {
      return DexInstructions.cancelOrder({
        market: this.address,
        owner,
        openOrders: order.openOrdersAddress,
        requestQueue: this._decoded.requestQueue,
        side: order.side,
        orderId: order.orderId,
        openOrdersSlot: order.openOrdersSlot,
        programId: this._programId,
      });
    }

    return DexInstructions.cancelOrderV2({
      market: this.address,
      owner,
      openOrders: order.openOrdersAddress,
      bids: this._decoded.bids,
      asks: this._decoded.asks,
      eventQueue: this._decoded.eventQueue,
      side: order.side,
      orderId: order.orderId,
      openOrdersSlot: order.openOrdersSlot,
      programId: this._programId,
    });
  }

  makeConsumeEventsInstruction(openOrdersAccounts, limit) {
    return DexInstructions.consumeEvents({
      market: this.address,
      eventQueue: this._decoded.eventQueue,
      coinFee: this._decoded.eventQueue,
      pcFee: this._decoded.eventQueue,
      openOrdersAccounts,
      limit,
      programId: this._programId,
    });
  }

  async settleFunds(
    connection,
    owner,
    openOrders,
    baseWallet,
    quoteWallet,
    referrerQuoteWallet = null,
  ) {
    if (!openOrders.owner.equals(owner.publicKey)) {
      throw new Error('Invalid open orders account');
    }
    if (referrerQuoteWallet && !this.supportsReferralFees) {
      throw new Error('This program ID does not support referrerQuoteWallet');
    }
    const { transaction, signers } = await this.makeSettleFundsTransaction(
      connection,
      openOrders,
      baseWallet,
      quoteWallet,
      referrerQuoteWallet,
    );
    return await this._sendTransaction(connection, transaction, [
      owner,
      ...signers,
    ]);
  }

  async makeSettleFundsTransaction(
    connection,
    openOrders,
    baseWallet,
    quoteWallet,
    referrerQuoteWallet = null,
  ) {
    // @ts-ignore
    const vaultSigner = await PublicKey.createProgramAddress(
      [
        this.address.toBuffer(),
        this._decoded.vaultSignerNonce.toArrayLike(Buffer, 'le', 8),
      ],
      this._programId,
    );
    const transaction = new Transaction();
    const signers = [];
    let wrappedSolAccount = null;
    if (
      (this.baseMintAddress.equals(WRAPPED_SOL_MINT) &&
        baseWallet.equals(openOrders.owner)) ||
      (this.quoteMintAddress.equals(WRAPPED_SOL_MINT) &&
        quoteWallet.equals(openOrders.owner))
    ) {
      wrappedSolAccount = new Account();
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: openOrders.owner,
          newAccountPubkey: wrappedSolAccount.publicKey,
          lamports: await connection.getMinimumBalanceForRentExemption(165),
          space: 165,
          programId: TOKEN_PROGRAM_ID,
        }),
      );
      transaction.add(
        initializeAccount({
          account: wrappedSolAccount.publicKey,
          mint: WRAPPED_SOL_MINT,
          owner: openOrders.owner,
        }),
      );
      signers.push(wrappedSolAccount);
    }
    transaction.add(
      DexInstructions.settleFunds({
        market: this.address,
        openOrders: openOrders.address,
        owner: openOrders.owner,
        baseVault: this._decoded.baseVault,
        quoteVault: this._decoded.quoteVault,
        baseWallet:
          baseWallet.equals(openOrders.owner) && wrappedSolAccount
            ? wrappedSolAccount.publicKey
            : baseWallet,
        quoteWallet:
          quoteWallet.equals(openOrders.owner) && wrappedSolAccount
            ? wrappedSolAccount.publicKey
            : quoteWallet,
        vaultSigner,
        programId: this._programId,
        referrerQuoteWallet,
      }),
    );
    if (wrappedSolAccount) {
      transaction.add(
        closeAccount({
          source: wrappedSolAccount.publicKey,
          destination: openOrders.owner,
          owner: openOrders.owner,
        }),
      );
    }
    return { transaction, signers, payer: openOrders.owner };
  }

  async matchOrders(connection, feePayer, limit) {
    const tx = this.makeMatchOrdersTransaction(limit);
    return await this._sendTransaction(connection, tx, [feePayer]);
  }

  makeMatchOrdersTransaction(limit) {
    const tx = new Transaction();
    tx.add(
      DexInstructions.matchOrders({
        market: this.address,
        requestQueue: this._decoded.requestQueue,
        eventQueue: this._decoded.eventQueue,
        bids: this._decoded.bids,
        asks: this._decoded.asks,
        baseVault: this._decoded.baseVault,
        quoteVault: this._decoded.quoteVault,
        limit,
        programId: this._programId,
      }),
    );
    return tx;
  }

  async loadRequestQueue(connection) {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.requestQueue),
    );
    return decodeRequestQueue(data);
  }

  async loadEventQueue(connection) {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.eventQueue),
    );
    return decodeEventQueue(data);
  }

  async loadFills(connection, limit = 100) {
    // TODO: once there's a separate source of fills use that instead
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.eventQueue),
    );
    const events = decodeEventQueue(data, limit);
    return events
      .filter(
        (event) => event.eventFlags.fill && event.nativeQuantityPaid.gtn(0),
      )
      .map(this.parseFillEvent.bind(this));
  }

  parseFillEvent(event) {
    let size, price, side, priceBeforeFees;
    if (event.eventFlags.bid) {
      side = 'buy';
      priceBeforeFees = event.eventFlags.maker
        ? event.nativeQuantityPaid.add(event.nativeFeeOrRebate)
        : event.nativeQuantityPaid.sub(event.nativeFeeOrRebate);
      price = divideBnToNumber(
        priceBeforeFees.mul(this._baseSplTokenMultiplier),
        this._quoteSplTokenMultiplier.mul(event.nativeQuantityReleased),
      );
      size = divideBnToNumber(
        event.nativeQuantityReleased,
        this._baseSplTokenMultiplier,
      );
    } else {
      side = 'sell';
      priceBeforeFees = event.eventFlags.maker
        ? event.nativeQuantityReleased.sub(event.nativeFeeOrRebate)
        : event.nativeQuantityReleased.add(event.nativeFeeOrRebate);
      price = divideBnToNumber(
        priceBeforeFees.mul(this._baseSplTokenMultiplier),
        this._quoteSplTokenMultiplier.mul(event.nativeQuantityPaid),
      );
      size = divideBnToNumber(
        event.nativeQuantityPaid,
        this._baseSplTokenMultiplier,
      );
    }
    return {
      ...event,
      side,
      price,
      feeCost:
        this.quoteSplSizeToNumber(event.nativeFeeOrRebate) *
        (event.eventFlags.maker ? -1 : 1),
      size,
    };
  }

  get _baseSplTokenMultiplier() {
    return new BN(10).pow(new BN(this._baseSplTokenDecimals));
  }

  get _quoteSplTokenMultiplier() {
    return new BN(10).pow(new BN(this._quoteSplTokenDecimals));
  }

  priceLotsToNumber(price) {
    return divideBnToNumber(
      price.mul(this._decoded.quoteLotSize).mul(this._baseSplTokenMultiplier),
      this._decoded.baseLotSize.mul(this._quoteSplTokenMultiplier),
    );
  }

  priceNumberToLots(price) {
    return new BN(
      Math.round(
        (price *
          Math.pow(10, this._quoteSplTokenDecimals) *
          this._decoded.baseLotSize.toNumber()) /
          (Math.pow(10, this._baseSplTokenDecimals) *
            this._decoded.quoteLotSize.toNumber()),
      ),
    );
  }

  baseSplSizeToNumber(size) {
    return divideBnToNumber(size, this._baseSplTokenMultiplier);
  }

  quoteSplSizeToNumber(size) {
    return divideBnToNumber(size, this._quoteSplTokenMultiplier);
  }

  baseSizeLotsToNumber(size) {
    return divideBnToNumber(
      size.mul(this._decoded.baseLotSize),
      this._baseSplTokenMultiplier,
    );
  }

  baseSizeNumberToLots(size) {
    const native = new BN(
      Math.round(size * Math.pow(10, this._baseSplTokenDecimals)),
    );
    // rounds down to the nearest lot size
    return native.div(this._decoded.baseLotSize);
  }

  quoteSizeLotsToNumber(size) {
    return divideBnToNumber(
      size.mul(this._decoded.quoteLotSize),
      this._quoteSplTokenMultiplier,
    );
  }

  quoteSizeNumberToLots(size) {
    const native = new BN(
      Math.round(size * Math.pow(10, this._quoteSplTokenDecimals)),
    );
    // rounds down to the nearest lot size
    return native.div(this._decoded.quoteLotSize);
  }

  get minOrderSize() {
    return this.baseSizeLotsToNumber(new BN(1));
  }

  get tickSize() {
    return this.priceLotsToNumber(new BN(1));
  }
}
export const _OPEN_ORDERS_LAYOUT_V1 = struct([
  blob(5),
  accountFlagsLayout('accountFlags'),
  publicKeyLayout('market'),
  publicKeyLayout('owner'),
  // These are in spl-token (i.e. not lot) units
  u64('baseTokenFree'),
  u64('baseTokenTotal'),
  u64('quoteTokenFree'),
  u64('quoteTokenTotal'),
  u128('freeSlotBits'),
  u128('isBidBits'),
  seq(u128(), 128, 'orders'),
  seq(u64(), 128, 'clientIds'),
  blob(7),
]);
export const _OPEN_ORDERS_LAYOUT_V2 = struct([
  blob(5),
  accountFlagsLayout('accountFlags'),
  publicKeyLayout('market'),
  publicKeyLayout('owner'),
  // These are in spl-token (i.e. not lot) units
  u64('baseTokenFree'),
  u64('baseTokenTotal'),
  u64('quoteTokenFree'),
  u64('quoteTokenTotal'),
  u128('freeSlotBits'),
  u128('isBidBits'),
  seq(u128(), 128, 'orders'),
  seq(u64(), 128, 'clientIds'),
  u64('referrerRebatesAccrued'),
  blob(7),
]);
export class OpenOrders {
  constructor(address, decoded, programId) {
    this.address = address;
    this._programId = programId;
    Object.assign(this, decoded);
  }

  static getLayout(programId) {
    if (getLayoutVersion(programId) === 1) {
      return _OPEN_ORDERS_LAYOUT_V1;
    }
    return _OPEN_ORDERS_LAYOUT_V2;
  }

  static async findForOwner(connection, ownerAddress, programId) {
    const filters = [
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf('owner'),
          bytes: ownerAddress.toBase58(),
        },
      },
      {
        dataSize: this.getLayout(programId).span,
      },
    ];
    const accounts = await getFilteredProgramAccounts(
      connection,
      programId,
      filters,
    );
    return accounts.map(({ publicKey, accountInfo }) =>
      OpenOrders.fromAccountInfo(publicKey, accountInfo, programId),
    );
  }

  static async findForMarketAndOwner(
    connection,
    marketAddress,
    ownerAddress,
    programId,
  ) {
    const filters = [
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf('market'),
          bytes: marketAddress.toBase58(),
        },
      },
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf('owner'),
          bytes: ownerAddress.toBase58(),
        },
      },
      {
        dataSize: this.getLayout(programId).span,
      },
    ];
    const accounts = await getFilteredProgramAccounts(
      connection,
      programId,
      filters,
    );
    return accounts.map(({ publicKey, accountInfo }) =>
      OpenOrders.fromAccountInfo(publicKey, accountInfo, programId),
    );
  }

  static async load(connection, address, programId) {
    const accountInfo = await connection.getAccountInfo(address);
    if (accountInfo === null) {
      throw new Error('Open orders account not found');
    }
    return OpenOrders.fromAccountInfo(address, accountInfo, programId);
  }

  static fromAccountInfo(address, accountInfo, programId) {
    const { owner, data } = accountInfo;
    if (!owner.equals(programId)) {
      throw new Error('Address not owned by program');
    }
    const decoded = this.getLayout(programId).decode(data);
    if (!decoded.accountFlags.initialized || !decoded.accountFlags.openOrders) {
      throw new Error('Invalid open orders account');
    }
    return new OpenOrders(address, decoded, programId);
  }

  static async makeCreateAccountTransaction(
    connection,
    marketAddress,
    ownerAddress,
    newAccountAddress,
    programId,
  ) {
    return SystemProgram.createAccount({
      fromPubkey: ownerAddress,
      newAccountPubkey: newAccountAddress,
      lamports: await connection.getMinimumBalanceForRentExemption(
        this.getLayout(programId).span,
      ),
      space: this.getLayout(programId).span,
      programId,
    });
  }

  get publicKey() {
    return this.address;
  }
}
export const ORDERBOOK_LAYOUT = struct([
  blob(5),
  accountFlagsLayout('accountFlags'),
  SLAB_LAYOUT.replicate('slab'),
  blob(7),
]);
export class Orderbook {
  constructor(market, accountFlags, slab) {
    if (!accountFlags.initialized || !(accountFlags.bids ^ accountFlags.asks)) {
      throw new Error('Invalid orderbook');
    }
    this.market = market;
    this.isBids = accountFlags.bids;
    this.slab = slab;
  }

  static get LAYOUT() {
    return ORDERBOOK_LAYOUT;
  }

  static decode(market, buffer) {
    const { accountFlags, slab } = ORDERBOOK_LAYOUT.decode(buffer);
    return new Orderbook(market, accountFlags, slab);
  }

  getL2(depth) {
    const descending = this.isBids;
    const levels = []; // (price, size)
    for (const { key, quantity } of this.slab.items(descending)) {
      const price = getPriceFromKey(key);
      if (levels.length > 0 && levels[levels.length - 1][0].eq(price)) {
        levels[levels.length - 1][1].iadd(quantity);
      } else if (levels.length === depth) {
        break;
      } else {
        levels.push([price, quantity]);
      }
    }
    return levels.map(([priceLots, sizeLots]) => [
      this.market.priceLotsToNumber(priceLots),
      this.market.baseSizeLotsToNumber(sizeLots),
      priceLots,
      sizeLots,
    ]);
  }

  [Symbol.iterator]() {
    return this.items(false);
  }

  *items(descending = false) {
    for (const {
      key,
      ownerSlot,
      owner,
      quantity,
      feeTier,
      clientOrderId,
    } of this.slab.items(descending)) {
      const price = getPriceFromKey(key);
      yield {
        orderId: key,
        clientId: clientOrderId,
        openOrdersAddress: owner,
        openOrdersSlot: ownerSlot,
        feeTier,
        price: this.market.priceLotsToNumber(price),
        priceLots: price,
        size: this.market.baseSizeLotsToNumber(quantity),
        sizeLots: quantity,
        side: this.isBids ? 'buy' : 'sell',
      };
    }
  }
}
function getPriceFromKey(key) {
  return key.ushrn(64);
}
function divideBnToNumber(numerator, denominator) {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}
const MINT_LAYOUT = struct([blob(44), u8('decimals'), blob(37)]);
export async function getMintDecimals(connection, mint) {
  if (mint.equals(WRAPPED_SOL_MINT)) {
    return 9;
  }
  const { data } = throwIfNull(
    await connection.getAccountInfo(mint),
    'mint not found',
  );
  const { decimals } = MINT_LAYOUT.decode(data);
  return decimals;
}
async function getFilteredProgramAccounts(connection, programId, filters) {
  // @ts-ignore
  const resp = await connection._rpcRequest('getProgramAccounts', [
    programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
      encoding: 'base64',
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result.map(
    ({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], 'base64'),
        executable,
        owner: new PublicKey(owner),
        lamports,
      },
    }),
  );
}
function throwIfNull(value, message = 'account not found') {
  if (value === null) {
    throw new Error(message);
  }
  return value;
}
