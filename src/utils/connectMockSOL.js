import nacl from 'tweetnacl';
import bs58 from 'bs58';
import ethUtil from 'ethereumjs-util';
import * as BufferLayout from 'buffer-layout';
import {
  Transaction,
  TransactionInstruction,
  SystemProgram,
  PublicKey,
  Account,
  SYSVAR_RENT_PUBKEY,
} from 'vendors/solanaWeb3';
import { CONST_TEST_MNEMONIC, CONST_TX_TYPES } from '../consts/consts';
import {
  HdKeyProviderEd25519,
  HdKeyProviderBip32,
} from '../wallets/HdKeyProvider';
import helpersSOL from '../wallets/SOL/modules/helpersSOL';
import utilsApp from './utilsApp';

const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u8('decimals'),
    BufferLayout.blob(32, 'mintAuthority'),
    BufferLayout.u8('freezeAuthorityOption'),
    BufferLayout.blob(32, 'freezeAuthority'),
  ]),
  'initializeMint',
);
LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
LAYOUT.addVariant(
  7,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'mintTo',
);
LAYOUT.addVariant(
  8,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'burn',
);
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');
LAYOUT.addVariant(
  12,
  BufferLayout.struct([
    BufferLayout.nu64('amount'),
    BufferLayout.u8('decimals'),
  ]),
  'transferChecked',
);

const instructionMaxSpan = Math.max(
  ...Object.values(LAYOUT.registry).map((r) => r.span),
);

function encodeTokenInstructionData(instruction) {
  const b = Buffer.alloc(instructionMaxSpan);
  const span = LAYOUT.encode(instruction, b);
  return b.slice(0, span);
}

function createTokenTransferIx({
  from,
  contract,
  to,
  amount,
  decimals,
  creator,
}) {
  const keys = [
    { pubkey: from, isSigner: false, isWritable: true },
    { pubkey: contract, isSigner: false, isWritable: false },
    { pubkey: to, isSigner: false, isWritable: true },
    { pubkey: creator, isSigner: true, isWritable: false },
  ];
  return new TransactionInstruction({
    keys,
    data: encodeTokenInstructionData({
      transferChecked: { amount, decimals },
    }),
    programId: helpersSOL.TOKEN_PROGRAM_ID,
  });
}

async function createAssociatedTokenIxAsync({
  creator, // wallet.publicKey, owner.publicKey
  contract,
}) {
  const associatedTokenAddress =
    await helpersSOL.generateAssociatedTokenAddress(creator, contract);
  const keys = [
    {
      pubkey: creator,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: creator,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: contract,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: helpersSOL.SYSTEM_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: helpersSOL.TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  const ix = new TransactionInstruction({
    keys,
    programId: helpersSOL.ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
  // return [ix, associatedTokenAddress];
  return ix;
}

async function convertTxInstructionAsync(payload) {
  const { type, from, to, amount, decimals, contract, creator } = payload;
  switch (type) {
    case CONST_TX_TYPES.Transfer:
      // new TransactionInstruction
      return SystemProgram.transfer({
        fromPubkey: new PublicKey(from),
        toPubkey: new PublicKey(to),
        lamports: amount,
      });
    case CONST_TX_TYPES.TokenTransfer:
      return createTokenTransferIx({
        from: new PublicKey(from),
        to: new PublicKey(to),
        amount,
        decimals,
        contract: new PublicKey(contract),
        creator: new PublicKey(creator),
      });
    case CONST_TX_TYPES.TokenAssociateAdd:
      return await createAssociatedTokenIxAsync({
        contract: new PublicKey(contract),
        creator: new PublicKey(creator),
      });
    default:
      throw new Error(`tx type not support:${type}`);
  }
}

async function signTx(txPayload) {
  // serialize payload to simulate params pass to hardware
  const txPayloadStr = JSON.stringify(txPayload);
  const res = await signTxInHardware(txPayloadStr);
  return JSON.parse(res);
}

async function signTxMessageInHardware(txSerializeMessage, hdPath) {
  const account = await getAccountFromMnemonic({ hdPath });

  // txSerializeMessage = bs58.encode(web3.Transaction.serializeMessage())
  // const buffer = bs58.decode(txSerializeMessage);
  const txBytes = bs58.decode(txSerializeMessage);
  return bs58.encode(nacl.sign.detached(txBytes, account.secretKey));
}

async function signTxInHardware(txPayloadStr) {
  const { instructions, recentBlockhash, creatorAddress, creatorHdPath } =
    JSON.parse(txPayloadStr);
  const tx = new Transaction({
    feePayer: new PublicKey(creatorAddress),
    // bs58.encode(Buffer.from(lastHash));
    recentBlockhash,
    instructions: await Promise.all(
      instructions.map((item) => convertTxInstructionAsync(item)),
    ),
  });

  // tx.recentBlockhash = bs58.encode(Buffer.from(lastHash));
  // tx.setSigners(new PublicKey(creatorAddress));

  const account = await getAccountFromMnemonic({ hdPath: creatorHdPath });
  tx.partialSign(account);

  console.log('signTxInHardware', tx);

  const rawTx = tx.serialize();
  return JSON.stringify({
    rawTx,
  });
}

async function getAccountFromMnemonicTest(hdPath = "m/44'/501'/0'/0'") {
  await getAccountFromMnemonic({
    hdPath,
  });
}

async function getEthAccountFromMnemonicTest(hdPath = "m/44'/60'/0'/0/0") {
  const rootSeed = await getRootSeed();

  await getEthAccountBase({
    deriveFunc: deriveByHDKey,
    seed: rootSeed,
    path: hdPath,
  });
}

async function deriveByHDKey({ seed, path }) {
  const hdkey = new HdKeyProviderBip32();
  const dpath = await hdkey.derivePath({
    seed: Buffer.from(seed, 'hex'),
    path,
  });
  const publicKey = dpath.publicKey.toString('hex');
  const privateKey = dpath.privateKey.toString('hex');
  const chainCode = dpath.chainCode.toString('hex');
  return {
    dpath,
    chainCode,
    publicKeyBytes: dpath.publicKey,
    publicKey,
    publicKeyLength: publicKey.length,
    privateKeyBytes: dpath.privateKey,
    privateKey,
    privateKeyLength: privateKey.length,
  };
}

async function driveByHDKeyED25519({ seed, path }) {
  const hdkey = new HdKeyProviderEd25519();
  const dpath = await hdkey.derivePath({
    seed: Buffer.from(seed, 'hex'),
    path,
  });
  const publicKey = dpath.publicKey.toString('hex');
  const privateKey = dpath.privateKey.toString('hex');
  const chainCode = dpath.chainCode.toString('hex');
  return {
    dpath,
    chainCode,
    publicKeyBytes: dpath.publicKey,
    publicKey,
    publicKeyLength: publicKey.length,
    privateKeyBytes: dpath.privateKey,
    privateKey,
    privateKeyLength: privateKey.length,
  };
}

function convertToSOLAddressFromDerivePublicKey(publicKeyBytes) {
  const publicKeyBytes32 = publicKeyBytes.slice(0, 32);
  // const bytes = publicKeyBytes;
  console.log({
    publicKeyStr: publicKeyBytes.toString('hex'),
    publicKeyBytes,
    publicKeyBytes32,
  });
  const publicKeyStr = bs58.encode(publicKeyBytes32);
  const solAddress = new PublicKey(publicKeyStr);
  return solAddress.toString('hex');
}

function ethPublicKeyToAddress(hdkeyPubKey) {
  const address = ethUtil.publicToAddress(hdkeyPubKey, true).toString('hex');
  return ethUtil.toChecksumAddress(`0x${address}`);
}

async function getEthAccountBase({ deriveFunc, seed, path }) {
  const dpath = await deriveFunc({
    seed,
    path,
  });
  const addressEth = ethPublicKeyToAddress(dpath.publicKeyBytes);

  console.log({
    path,
    defiveFuncName: deriveFunc.name,
    dpath,
    dpathPublicKey: dpath.publicKey,
    addressEth,
  });
  return addressEth;
}

async function getAccountBase({ deriveFunc, seed, path }) {
  const dpath = await deriveFunc({
    seed,
    path,
  });

  const account = new Account(
    nacl.sign.keyPair.fromSeed(dpath.privateKeyBytes).secretKey,
  );
  const address1 = new PublicKey(account.publicKey).toString();

  const address2 = convertToSOLAddressFromDerivePublicKey(dpath.publicKeyBytes);

  console.log({
    path,
    defiveFuncName: deriveFunc.name,
    dpath,
    account,
    dpathPublicKey: dpath.publicKey,
    accountPublicKey: account.publicKey.toString('hex'),
    accountPublicKeyBs58Decode: bs58
      .decode(account.publicKey.toString('hex'))
      .toString('hex'),
    address1,
    address2,
  });
  return account;
}

async function getRootSeed() {
  return await utilsApp.mnemonicToSeed(CONST_TEST_MNEMONIC);
}

async function getAccountFromMnemonic({ mnemonic, hdPath }) {
  const rootSeed = mnemonic
    ? await utilsApp.mnemonicToSeed(mnemonic)
    : await getRootSeed();

  // ----------------------------------------------
  const acc1 = getAccountBase({
    deriveFunc: deriveByHDKey,
    seed: rootSeed,
    path: hdPath,
  });
  // ----------------------------------------------
  const acc2 = getAccountBase({
    deriveFunc: driveByHDKeyED25519,
    seed: rootSeed,
    path: hdPath,
  });

  // const _solAddress = new PublicKey(_publicKey);

  // const acc = new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
  // return new Account();
  // const acc = new Account(dkey.privateKey);

  // const acc = new Account(dkey.key);
  // const acc = new Account(dkey.privateExtendedKey);
  // const acc = new Account(
  //   nacl.sign.keyPair.fromSeed(dkey.privateKey).secretKey,
  // );

  return acc2;
}

/*
// add instructions
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: destination,
      lamports: amount,
    }),
  );

  // set recentBlockhash
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;

  // set signers by publicKey(address bytes)
  transaction.setSigners(
    // fee payed by the wallet owner
    wallet.publicKey,
    // TODO zz multiple sign?
    ...signers.map((s) => s.publicKey),
  );

  // do sign
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  transaction.partialSign(this.account); // web3 Account

  // serialize
  const rawTransaction = transaction.serialize();

  // post to chain
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight,
    preflightCommitment: 'single',
  });

 */

export default {
  getEthAccountFromMnemonicTest,
  getAccountFromMnemonicTest,
  getAccountFromMnemonic,
  signTx,
  signTxMessageInHardware,
};
