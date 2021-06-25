export const CONST_TEST_MNEMONIC =
  'ankle trigger render gadget chicken rapid grunt execute taste culture image address tape fence wear increase saddle mansion lonely fox effort jacket romance glue';
export const CONST_BTC = 'BTC';
export const CONST_ETH = 'ETH';
export const CONST_SOL = 'SOL';
export const CONST_BNB = 'BNB';
export const CONST_CHAIN_KEYS = {
  BTC: 'BTC',
  BSC: 'BSC',
  BSC_TEST_NET: 'BSC_TEST_NET',
  ETH: 'ETH',
  SOL: 'SOL',
  SOL_TEST_NET: 'SOL_TEST_NET',
};
export const CONST_HARDWARE_MODELS = {
  OneKeyClassic: 'onekey',
  OneKeyMini: 'onekey_mini',
  OneKeyPro: 'onekey_pro',
  Unknown: 'unknown',
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
  INPAGE_TO_CONTENT: 'sollet_injected_script_message',
  CONTENT_TO_INPAGE: 'sollet_contentscript_message',
  CONTENT_TO_BG: 'sollet_contentscript_background_channel',
  POPUP_TO_BG: 'sollet_extension_background_channel',
  POPUP_TO_BG_MNEMONIC: 'sollet_extension_mnemonic_channel',
};
