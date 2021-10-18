function getChainId(options) {
  return options?.chainInfo?.tokenChainId;
}

function getNativeTokenDecimals(options) {
  return options?.chainInfo?.nativeToken?.decimals;
}

function getAddTokenMode(options) {
  return options?.chainInfo?.addTokenMode;
}

export default {
  getChainId,
  getNativeTokenDecimals,
  getAddTokenMode,
};
