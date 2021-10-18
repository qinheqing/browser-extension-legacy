function getChainId(options) {
  return options?.chainInfo?.tokenChainId;
}

function getNativeTokenDecimals(options) {
  return options?.chainInfo?.nativeToken?.decimals;
}

function getAddTokenMode(options) {
  return options?.chainInfo?.addTokenMode;
}

function getBaseChain(options) {
  return options?.chainInfo?.baseChain;
}

export default {
  getChainId,
  getBaseChain,
  getNativeTokenDecimals,
  getAddTokenMode,
};
