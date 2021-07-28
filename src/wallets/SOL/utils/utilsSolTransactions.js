/* eslint-disable no-param-reassign,no-void,no-use-before-define,consistent-return,no-shadow,no-case-declarations */
// @ts-nocheck
// https://github.com/project-serum/spl-token-wallet/blob/master/src/utils/transactions.ts
// ----------------------------------------------
import bs58 from 'bs58';
import {
  PublicKey,
  Message,
  StakeInstruction,
  StakeProgram,
  SystemInstruction,
  SystemProgram,
} from 'vendors/solanaWeb3';
import helpersSOL from '../modules/helpersSOL';
import {
  decodeInstruction,
  SETTLE_FUNDS_BASE_WALLET_INDEX,
  SETTLE_FUNDS_QUOTE_WALLET_INDEX,
  NEW_ORDER_OPEN_ORDERS_INDEX,
  NEW_ORDER_OWNER_INDEX,
  NEW_ORDER_V3_OPEN_ORDERS_INDEX,
  NEW_ORDER_V3_OWNER_INDEX,
} from './instructions';

// import { Market, MARKETS } from '@project-serum/serum';
import { MARKETS } from './tokens_and_markets';
import { Market } from './market';

// import { decodeTokenInstruction } from '@project-serum/token';
import { decodeTokenInstruction } from './tokenInstructions';

const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = helpersSOL;

const RAYDIUM_STAKE_PROGRAM_ID = new PublicKey(
  'EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q',
);
const RAYDIUM_LP_PROGRAM_ID = new PublicKey(
  'RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr',
);
const MANGO_PROGRAM_ID = new PublicKey(
  'JD3bq9hGdy38PuWQ4h2YJpELmHVGPPfFSuFkpzAd9zfu',
);
const MANGO_PROGRAM_ID_V2 = new PublicKey(
  '5fNfvyp5czQVX77yoACa3JJVEhdRaWjPuazuWgjhTqEH',
);

const marketCache = {};
let marketCacheConnection = null;
const cacheDuration = 15 * 1000;

export const decodeSolTransactionMessage = async (
  connection,
  wallet,
  message,
) => {
  // get message object
  const transactionMessage = Message.from(message);
  const instructions = [];

  if (
    transactionMessage?.instructions?.length &&
    transactionMessage?.accountKeys?.length
  ) {
    // get owned keys (used for security checks)
    const { publicKey } = wallet;
    // get instructions
    for (let i = 0; i < transactionMessage.instructions.length; i++) {
      const transactionInstruction = transactionMessage.instructions[i];
      const instruction = await toInstruction(
        connection,
        publicKey,
        transactionMessage?.accountKeys || [],
        transactionInstruction,
        transactionMessage,
        i,
      );
      instructions.push({
        ...instruction,
        rawIx: transactionInstruction,
        rawData: transactionInstruction?.data,
      });
    }
  }

  return {
    rawTx: transactionMessage,
    instructions,
  };
};
const toInstruction = async (
  connection,
  publicKey,
  accountKeys,
  instruction,
  transactionMessage,
  index,
) => {
  const { accounts = [], data = '', programIdIndex } = instruction || {};
  // get instruction data ( Buffer type )
  const dataDecoded = data && bs58.decode(data);
  const programId =
    programIdIndex && getAccountByIndex([programIdIndex], accountKeys, 0);

  const instructionCommon = {
    data: {
      programId,
      data, // data as String type
    },
    accountMetas: accounts.map((index) => {
      const publicKey = accountKeys[index];
      return {
        publicKey,
        publicKeyStr: publicKey ? publicKey.toString() : '',
        isWritable: transactionMessage.isAccountWritable(index),
      };
    }),
    programId,
    programIdStr: programId ? programId.toString() : '',
  };
  const unknownInstruction = {
    ...instructionCommon,
    type: 'unknown',
  };

  if (!programId) {
    return unknownInstruction;
  }
  try {
    // CreateTokenAccount [Program Id]
    if (programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)) {
      return handleAssociateTokenInstruction({
        instructionCommon,
        publicKey,
        instruction,
        accountKeys,
        connection,
      });
    }
    if (programId.equals(SystemProgram.programId)) {
      console.log(`[${index}] Handled as system instruction`);
      return handleSystemInstruction(publicKey, instruction, accountKeys);
    } else if (programId.equals(StakeProgram.programId)) {
      console.log(`[${index}] Handled as stake instruction`);
      return handleStakeInstruction(publicKey, instruction, accountKeys);
    } else if (programId.equals(TOKEN_PROGRAM_ID)) {
      console.log(`[${index}] Handled as token instruction`);
      return handleTokenInstruction(publicKey, instruction, accountKeys);
    } else if (
      MARKETS.some(
        (market) => market.programId && market.programId.equals(programId),
      )
    ) {
      console.log(`[${index}] Handled as dex instruction`);
      const decodedInstruction = decodeInstruction(dataDecoded);
      return await handleDexInstruction(
        connection,
        instruction,
        accountKeys,
        decodedInstruction,
      );
    } else if (programId.equals(RAYDIUM_STAKE_PROGRAM_ID)) {
      console.log(`[${index}] Handled as raydium stake instruction`);
      const decodedInstruction = decodeStakeInstruction(dataDecoded);
      return await handleRayStakeInstruction(
        connection,
        instruction,
        accountKeys,
        decodedInstruction,
      );
    } else if (programId.equals(RAYDIUM_LP_PROGRAM_ID)) {
      console.log(`[${index}] Handled as raydium lp instruction`);
      const decodedInstruction = decodeLpInstruction(dataDecoded);
      return await handleRayLpInstruction(
        connection,
        instruction,
        accountKeys,
        decodedInstruction,
      );
    } else if (
      programId.equals(MANGO_PROGRAM_ID) ||
      programId.equals(MANGO_PROGRAM_ID_V2)
    ) {
      console.log(`[${index}] Handled as mango markets instruction`);
      const decodedInstruction = decodeMangoInstruction(dataDecoded);
      return await handleMangoInstruction(
        connection,
        instruction,
        accountKeys,
        decodedInstruction,
      );
    }
    console.log('Instruction is unknown', unknownInstruction);
    return unknownInstruction;
  } catch (e) {
    console.log(`Failed to decode instruction: ${e}`);
  }
  // all decodings failed
  console.log(`[${index}] Failed, data: ${JSON.stringify(dataDecoded)}`);
  return unknownInstruction;
};

function handleAssociateTokenInstruction({ instructionCommon }) {
  return {
    ...instructionCommon,
    type: 'createTokenAccount',
  };
}

const handleMangoInstruction = async (
  connection,
  instruction,
  accountKeys,
  decodedInstruction,
) => {
  // TODO
  return {
    type: 'mango',
  };
};
const handleRayStakeInstruction = async (
  connection,
  instruction,
  accountKeys,
  decodedInstruction,
) => {
  // TODO
  return {
    type: 'raydium',
  };
};
const handleRayLpInstruction = async (
  connection,
  instruction,
  accountKeys,
  decodedInstruction,
) => {
  // TODO
  return {
    type: 'raydium',
  };
};
const decodeMangoInstruction = () => {
  // TODO
  return undefined;
};
const decodeStakeInstruction = () => {
  // TODO
  return undefined;
};
const decodeLpInstruction = () => {
  // TODO
  return undefined;
};
const handleDexInstruction = async (
  connection,
  instruction,
  accountKeys,
  decodedInstruction,
) => {
  if (!decodedInstruction || Object.keys(decodedInstruction).length > 1) {
    return;
  }
  const { accounts, programIdIndex } = instruction;
  // get market info
  const marketInfo =
    accountKeys &&
    MARKETS.find(
      (market) =>
        accountKeys.findIndex((accountKey) =>
          accountKey.equals(market.address),
        ) > -1,
    );
  // get market
  let market, programIdAddress;
  try {
    const marketAddress =
      (marketInfo === null || marketInfo === void 0
        ? void 0
        : marketInfo.address) || getAccountByIndex(accounts, accountKeys, 0);
    programIdAddress =
      (marketInfo === null || marketInfo === void 0
        ? void 0
        : marketInfo.programId) ||
      getAccountByIndex([programIdIndex], accountKeys, 0);
    const strAddress = marketAddress.toBase58();
    const now = new Date().getTime();
    if (
      !(
        connection === marketCacheConnection &&
        strAddress in marketCache &&
        now - marketCache[strAddress].ts < cacheDuration
      )
    ) {
      marketCacheConnection = connection;
      console.log('Loading market', strAddress);
      marketCache[strAddress] = {
        market: await Market.load(
          connection,
          marketAddress,
          {},
          programIdAddress,
        ),
        ts: now,
      };
    }
    market = marketCache[strAddress].market;
  } catch (e) {
    console.log(`Error loading market: ${e.message}`);
  }
  // get data
  const type = Object.keys(decodedInstruction)[0];
  let data = decodedInstruction[type];
  if (type === 'settleFunds') {
    const settleFundsData = getSettleFundsData(accounts, accountKeys);
    if (!settleFundsData) {
      return;
    }
    data = { ...data, ...settleFundsData };
  } else if (type === 'newOrder') {
    const newOrderData = getNewOrderData(accounts, accountKeys);
    data = { ...data, ...newOrderData };
  } else if (type === 'newOrderV3') {
    const newOrderData = getNewOrderV3Data(accounts, accountKeys);
    data = { ...data, ...newOrderData };
  }
  return {
    type,
    data,
    market,
    marketInfo,
  };
};
const handleSystemInstruction = (publicKey, instruction, accountKeys) => {
  const { programIdIndex, accounts, data } = instruction;
  if (!programIdIndex || !accounts || !data) {
    return;
  }
  // construct system instruction
  const systemInstruction = {
    programId: accountKeys[programIdIndex],
    keys: accounts.map((accountIndex) => ({
      pubkey: accountKeys[accountIndex],
    })),
    data: bs58.decode(data),
  };
  // get layout
  let decoded;
  const type = SystemInstruction.decodeInstructionType(systemInstruction);
  switch (type) {
    case 'Create':
      decoded = SystemInstruction.decodeCreateAccount(systemInstruction);
      break;
    case 'CreateWithSeed':
      decoded = SystemInstruction.decodeCreateWithSeed(systemInstruction);
      break;
    case 'Allocate':
      decoded = SystemInstruction.decodeAllocate(systemInstruction);
      break;
    case 'AllocateWithSeed':
      decoded = SystemInstruction.decodeAllocateWithSeed(systemInstruction);
      break;
    case 'Assign':
      decoded = SystemInstruction.decodeAssign(systemInstruction);
      break;
    case 'AssignWithSeed':
      decoded = SystemInstruction.decodeAssignWithSeed(systemInstruction);
      break;
    case 'Transfer':
      decoded = SystemInstruction.decodeTransfer(systemInstruction);
      break;
    case 'AdvanceNonceAccount':
      decoded = SystemInstruction.decodeNonceAdvance(systemInstruction);
      break;
    case 'WithdrawNonceAccount':
      decoded = SystemInstruction.decodeNonceWithdraw(systemInstruction);
      break;
    case 'InitializeNonceAccount':
      decoded = SystemInstruction.decodeNonceInitialize(systemInstruction);
      break;
    case 'AuthorizeNonceAccount':
      decoded = SystemInstruction.decodeNonceAuthorize(systemInstruction);
      break;
    default:
      return;
  }
  if (
    !decoded ||
    (decoded.fromPubkey && !publicKey.equals(decoded.fromPubkey))
  ) {
    return;
  }
  return {
    type: `system${type}`,
    data: decoded,
  };
};
const handleStakeInstruction = (publicKey, instruction, accountKeys) => {
  const { programIdIndex, accounts, data } = instruction;
  if (!programIdIndex || !accounts || !data) {
    return;
  }
  // construct stake instruction
  const stakeInstruction = {
    programId: accountKeys[programIdIndex],
    keys: accounts.map((accountIndex) => ({
      pubkey: accountKeys[accountIndex],
    })),
    data: bs58.decode(data),
  };
  let decoded;
  const type = StakeInstruction.decodeInstructionType(stakeInstruction);
  switch (type) {
    case 'AuthorizeWithSeed':
      decoded = StakeInstruction.decodeAuthorizeWithSeed(stakeInstruction);
      break;
    case 'Authorize':
      decoded = StakeInstruction.decodeAuthorize(stakeInstruction);
      break;
    case 'Deactivate':
      decoded = StakeInstruction.decodeDeactivate(stakeInstruction);
      break;
    case 'Delegate':
      decoded = StakeInstruction.decodeDelegate(stakeInstruction);
      break;
    case 'Initialize':
      decoded = StakeInstruction.decodeInitialize(stakeInstruction);
      // Lockup inactive if all zeroes
      const { lockup } = decoded;
      if (
        lockup &&
        lockup.unixTimestamp === 0 &&
        lockup.epoch === 0 &&
        lockup.custodian.equals(PublicKey.default)
      ) {
        decoded.lockup = 'Inactive';
      } else {
        decoded.lockup = `unixTimestamp: ${lockup.unixTimestamp}, custodian: ${
          lockup.epoch
        }, custodian: ${lockup.custodian.toBase58()}`;
      }
      // flatten authorized to allow address render
      decoded.authorizedStaker = decoded.authorized.staker;
      decoded.authorizedWithdrawer = decoded.authorized.withdrawer;
      delete decoded.authorized;
      break;
    case 'Split':
      decoded = StakeInstruction.decodeSplit(stakeInstruction);
      break;
    case 'Withdraw':
      decoded = StakeInstruction.decodeWithdraw(stakeInstruction);
      break;
    default:
      return;
  }
  if (
    !decoded ||
    (decoded.fromPubkey && !publicKey.equals(decoded.fromPubkey))
  ) {
    return;
  }
  return {
    type: `stake${type}`,
    data: decoded,
  };
};
const handleTokenInstruction = (publicKey, instruction, accountKeys) => {
  const { programIdIndex, accounts, data } = instruction;
  if (!programIdIndex || !accounts || !data) {
    return;
  }
  // construct token instruction
  const tokenInstruction = {
    programId: accountKeys[programIdIndex],
    keys: accounts.map((accountIndex) => ({
      pubkey: accountKeys[accountIndex],
    })),
    data: bs58.decode(data),
  };
  const decoded = decodeTokenInstruction(tokenInstruction);
  return {
    type: decoded.type,
    data: decoded.params,
  };
};
const getNewOrderData = (accounts, accountKeys) => {
  const openOrdersPubkey = getAccountByIndex(
    accounts,
    accountKeys,
    NEW_ORDER_OPEN_ORDERS_INDEX,
  );
  const ownerPubkey = getAccountByIndex(
    accounts,
    accountKeys,
    NEW_ORDER_OWNER_INDEX,
  );
  return { openOrdersPubkey, ownerPubkey };
};
const getNewOrderV3Data = (accounts, accountKeys) => {
  const openOrdersPubkey = getAccountByIndex(
    accounts,
    accountKeys,
    NEW_ORDER_V3_OPEN_ORDERS_INDEX,
  );
  const ownerPubkey = getAccountByIndex(
    accounts,
    accountKeys,
    NEW_ORDER_V3_OWNER_INDEX,
  );
  return { openOrdersPubkey, ownerPubkey };
};
const getSettleFundsData = (accounts, accountKeys) => {
  const basePubkey = getAccountByIndex(
    accounts,
    accountKeys,
    SETTLE_FUNDS_BASE_WALLET_INDEX,
  );
  const quotePubkey = getAccountByIndex(
    accounts,
    accountKeys,
    SETTLE_FUNDS_QUOTE_WALLET_INDEX,
  );
  if (!basePubkey || !quotePubkey) {
    return;
  }
  return { basePubkey, quotePubkey };
};
const getAccountByIndex = (accounts, accountKeys, accountIndex) => {
  const index = accounts.length > accountIndex && accounts[accountIndex];
  return (
    (accountKeys === null || accountKeys === void 0
      ? void 0
      : accountKeys.length) > index && accountKeys[index]
  );
};
