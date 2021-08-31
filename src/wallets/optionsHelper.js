function getChainId(options) {
  return options?.chainInfo?.tokenChainId;
}

function getNativeTokenDecimals(options) {
  return options?.chainInfo?.nativeToken?.decimals;
}

export default {
  getChainId,
  getNativeTokenDecimals,
};
