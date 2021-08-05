import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import OneTokenInfo from '../../../classes/OneTokenInfo';

// TODO move to chainProvider
class TokenController {
  constructor(options) {
    this.options = options;
    this.internalChainId = this.options.chainInfo.internalChainId;
  }

  async getTokenListMetaAsync() {
    const tokens = await new TokenListProvider().resolve();
    const tokenList = tokens.filterByChainId(this.internalChainId).getList();
    return tokenList;
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

export default TokenController;
