export const CONST_TEST_MNEMONIC =
  'ankle trigger render gadget chicken rapid grunt execute taste culture image address tape fence wear increase saddle mansion lonely fox effort jacket romance glue';
export const CONST_BTC = 'BTC';
export const CONST_ETH = 'ETH';
export const CONST_SOL = 'SOL';
export const CONST_BNB = 'BNB';
export const CONST_CHAIN_KEYS = {
  BTC: 'BTC',
  BSC: 'BSC',
  BSC_TEST_NET: 'BSC_T',
  ETH: 'ETH',
  SOL: 'SOL',
  SOL_TEST_NET: 'SOL_T',
};
export const CONST_HARDWARE_MODELS = {
  OneKeyClassic: 'onekey',
  OneKeyMini: 'onekey_mini',
  OneKeyPro: 'onekey_pro',
  Unknown: '',
};
export const CONST_TX_TYPES = {
  Transfer: 'Transfer',
  TokenTransfer: 'TokenTransfer',
  TokenAssociateAdd: 'TokenAssociateAdd',
  Unknown: 'Unknown',
};
export const CONSTS_ACCOUNT_TYPES = {
  SingleChain: 'SingleChain', // mnemonic、seed、private key、keyStore import single chain account
  Observer: 'Observer', // Observer account
  Hardware: 'Hardware', // Hardware HD account
  Wallet: 'Wallet', // Wallet HD account
};
export const CONST_ACCOUNTS_GROUP_FILTER_TYPES = {
  wallet: 'wallet',
  hardware: 'hardware',
  chain: 'chain',
};

export const CONST_DAPP_MESSAGE_TYPES = {
  EVENT_INPAGE_TO_CONTENT: 'ONEKEY_EXT_EVENT_INPAGE_TO_CONTENT',
  EVENT_CONTENT_TO_INPAGE: 'ONEKEY_EXT_EVENT_CONTENT_TO_INPAGE',
  CHANNEL_CONTENT_TO_BG: 'ONEKEY_EXT_CHANNEL_CONTENT_TO_BG',
  CHANNEL_POPUP_TO_BG: 'ONEKEY_EXT_CHANNEL_POPUP_TO_BG',
  // TODO remove
  CHANNEL_POPUP_TO_BG_MNEMONIC: 'ONEKEY_EXT_CHANNEL_POPUP_TO_BG_MNEMONIC',
};

export const BACKGROUND_PROXY_MODULE_NAMES = {
  hardware: 'hardware',
  keyring: 'keyring',
};

export const CONST_DURATIONS = {
  SECOND: 1000,
  MIN: 60 * 1000,
  MIN5: 5 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};
