import * as BufferLayout from 'buffer-layout';
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Account,
  SYSVAR_RENT_PUBKEY,
} from 'vendors/solanaWeb3';

const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

const WRAPPED_SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

const COMMITMENT_TYPES = {
  processed: 'processed',
  confirmed: 'confirmed',
  finalized: 'finalized',
};

const MEMO_PROGRAM_ID = new PublicKey(
  'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo',
);

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const ACCOUNT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(32, 'mint'),
  BufferLayout.blob(32, 'owner'),
  BufferLayout.nu64('amount'),
  BufferLayout.blob(93),
]);

const MINT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(44),
  BufferLayout.u8('decimals'),
  BufferLayout.blob(37),
]);

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

function getOwnedAccountsFilters(publicKey) {
  return [
    {
      memcmp: {
        offset: ACCOUNT_LAYOUT.offsetOf('owner'),
        bytes: publicKey.toBase58(),
      },
    },
    {
      dataSize: ACCOUNT_LAYOUT.span,
    },
  ];
}

function parseTokenAccountData(accountInfoData) {
  const { mint, owner, amount } = ACCOUNT_LAYOUT.decode(accountInfoData);
  return {
    mint: new PublicKey(mint),
    owner: new PublicKey(owner),
    amount,
  };
}

async function generateAssociatedTokenAddress(
  accountAddress,
  tokenMintAddress,
) {
  const associatedAddress = (
    await PublicKey.findProgramAddress(
      [
        accountAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )
  )[0];

  return associatedAddress;
}

function encodeTokenInstructionData(instruction) {
  const b = Buffer.alloc(instructionMaxSpan);
  const span = LAYOUT.encode(instruction, b);
  return b.slice(0, span);
}

async function createAssociatedTokenIxAsync({
  creatorAddress, // creator can add associate token for another account
  accountAddress,
  mintAddress,
}) {
  const associatedTokenAddress = await generateAssociatedTokenAddress(
    accountAddress,
    mintAddress,
  );
  const keys = [
    {
      pubkey: creatorAddress,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: accountAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: mintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSTEM_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
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
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
  // return [ix, associatedTokenAddress];
  return ix;
}

export default {
  COMMITMENT_TYPES,
  ACCOUNT_LAYOUT,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  MEMO_PROGRAM_ID,
  getOwnedAccountsFilters,
  parseTokenAccountData,
  generateAssociatedTokenAddress,
  encodeTokenInstructionData,
  createAssociatedTokenIxAsync,
};
