import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import OneTokenInfo from '../../../../classes/OneTokenInfo';

const recommendsTokenKeys = {
  10101010: {
    SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: true,
  },
};

class TokenManager {
  constructor(options) {
    this.options = options;
    this.tokenChainId = this.options.chainInfo.tokenChainId;
  }

  async getTokenListMetaAsync() {
    const tokens = await new TokenListProvider().resolve();
    const tokenList = tokens.filterByChainId(this.tokenChainId).getList();
    return tokenList;
  }

  getRecommendTokenAddresses() {
    const keys = recommendsTokenKeys[this.tokenChainId];
    return keys || {};
  }

  generateTokenKey(tokenInfo) {
    const { chainKey, address } = tokenInfo;
    return `${chainKey} => ${address}`;
  }

  newTokenInfo(options) {
    const key = this.generateTokenKey(options);
    return new OneTokenInfo({
      ...options,
      key,
    });
  }
}

export default TokenManager;
