import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';

class TokenController {
  constructor(options) {
    this.options = options;
    this.internalChainId = this.options.chainInfo.internalChainId;
  }

  tokenList = null;

  async getTokenListAsync() {
    if (this.tokenList) {
      return this.tokenList;
    }
    const tokens = await new TokenListProvider().resolve();
    this.tokenList = tokens.filterByChainId(this.internalChainId).getList();
    return this.tokenList;
  }
}

export default TokenController;
