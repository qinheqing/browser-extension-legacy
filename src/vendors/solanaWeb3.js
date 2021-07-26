// because @solana/web3.js is NOT compatible with browserify, so we use global js instead.
/*
if main: ./lib/index.browser.esm.js
  SyntaxError: 'import' and 'export' may appear only with 'sourceType: module'

if main: lib/index.cjs.js
  Fetch TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation
 */
const {
  Transaction,
  TransactionInstruction,
  SystemProgram,
  PublicKey,
  Account,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  Message,
  Connection,
  clusterApiUrl,
  StakeInstruction,
  StakeProgram,
  SystemInstruction,
} = global.solanaWeb3;

export {
  Transaction,
  TransactionInstruction,
  SystemProgram,
  PublicKey,
  Account,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  Message,
  Connection,
  clusterApiUrl,
  StakeInstruction,
  StakeProgram,
  SystemInstruction,
};
