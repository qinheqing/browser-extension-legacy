function normalizeChainInfo(config) {
  config.chainLogo = config.chainLogo || config.logo;
  config.currency = config.nativeToken?.symbol;
  config.currencyLogo = config.nativeToken?.logoURI;
  config.tokenChainId = config.nativeToken?.chainId;
  return config;
}

export { normalizeChainInfo };
