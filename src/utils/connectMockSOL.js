import nacl from 'tweetnacl';
import bs58 from 'bs58';
import ethUtil from 'ethereumjs-util';
import { CONST_TX_TYPES } from '../consts/consts';
import {
  HdKeyProviderEd25519,
  HdKeyProviderBip32,
} from '../wallets/HdKeyProvider';
import utilsApp from './utilsApp';

const {
  Transaction,
  TransactionInstruction,
  SystemProgram,
  PublicKey,
  Account,
} = global.solanaWeb3;

function convertTxInstruction(payload) {
  const { type, from, to, amount } = payload;
  switch (type) {
    case CONST_TX_TYPES.Transfer:
      // new TransactionInstruction
      return SystemProgram.transfer({
        fromPubkey: new PublicKey(from),
        toPubkey: new PublicKey(to),
        lamports: amount,
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

async function signTxInHardware(txPayloadStr) {
  const { instructions, lastHash, creator, creatorHdPath } =
    JSON.parse(txPayloadStr);
  const tx = new Transaction();
  instructions.forEach((item) => {
    tx.add(convertTxInstruction(item));
  });
  // tx.recentBlockhash = bs58.encode(Buffer.from(lastHash));
  tx.recentBlockhash = lastHash;
  tx.setSigners(new PublicKey(creator));

  const account = await getAccountFromMnemonic({ hdPath: creatorHdPath });
  tx.partialSign(account);

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
  const solAddress = new global.solanaWeb3.PublicKey(publicKeyStr);
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
  const address1 = new global.solanaWeb3.PublicKey(
    account.publicKey,
  ).toString();

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
  return await utilsApp.mnemonicToSeed(
    'ankle trigger render gadget chicken rapid grunt execute taste culture image address tape fence wear increase saddle mansion lonely fox effort jacket romance glue',
  );
}

async function getAccountFromMnemonic({ hdPath }) {
  const rootSeed = await getRootSeed();

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
};
