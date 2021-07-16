export const IS_ENV_IN_TEST_OR_DEBUG =
  process.env.IN_TEST === 'true' || process.env.METAMASK_DEBUG;

export const ETH = 'ETH';
export const GWEI = 'GWEI';
export const WEI = 'WEI';

export const PRIMARY = 'PRIMARY';
export const SECONDARY = 'SECONDARY';

export const ERC20 = 'ERC20';

export const GAS_ESTIMATE_TYPES = {
  SLOW: 'SLOW',
  AVERAGE: 'AVERAGE',
  FAST: 'FAST',
  FASTEST: 'FASTEST',
};

export const CONST_FIRST_TIME_FLOW_TYPES = {
  CREATE: 'create',
  IMPORT: 'import',
  CONNECT_HW: 'connect-hw',
};

export const WALLET_ACCOUNT_TYPES = {
  HARDWARE: 'hardware', // Trezor Hardware, Ledger Hardware
  IMPORTED: 'imported', // Simple Key Pair
  WATCHED: 'watched', // Watch Account
  DEFAULT: 'default', // Wallet HD Account
};
