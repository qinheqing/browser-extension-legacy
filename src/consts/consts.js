export const CONST_TEST_MNEMONIC = '';
export const CONST_BTC = 'BTC';
export const CONST_ETH = 'ETH';
export const CONST_SOL = 'SOL';
export const CONST_BNB = 'BNB';
export const CONST_CFX = 'CFX';
export const CONST_CHAIN_KEYS = {
  BTC: 'BTC',
  ETH: 'ETH',
  BSC: 'BSC',
  BSC_TEST_NET: 'BSC_T',
  SOL: 'SOL',
  SOL_TEST_NET: 'SOL_T',
  CFX: 'CFX',
  CFX_TEST: 'CFX_T',
};
export const CONST_ADD_TOKEN_MODE = {
  LOCAL: 'LOCAL',
  CHAIN: 'CHAIN',
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
  WatchOnly: 'WatchOnly', // WatchOnly account
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
  misc: 'misc',
  approve: 'approve',
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

export const CONST_ERC20_METHODS_HEX = {
  balanceOf: '0x70a08231',
  approve: '0x095ea7b3',
  allowance: '0xdd62ed3e',
  transfer: '0xa9059cbb',
  name: '0x06fdde03',
  symbol: '0x95d89b41',
  decimals: '0x313ce567',
};
