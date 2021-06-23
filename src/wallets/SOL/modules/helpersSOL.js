import * as BufferLayout from 'buffer-layout';

const { Connection, clusterApiUrl, PublicKey } = global.solanaWeb3;

const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

const WRAPPED_SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

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

async function findAssociatedTokenAddress(
  walletAddress,
  tokenMintAddress,
  tokenAddress,
) {
  const associatedAddress = (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )
  )[0];

  return associatedAddress;
}

export default {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  MEMO_PROGRAM_ID,
  getOwnedAccountsFilters,
  parseTokenAccountData,
  findAssociatedTokenAddress,
};
