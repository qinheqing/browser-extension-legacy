import OneTokenInfo from '../classes/OneTokenInfo';
import utilsApp from '../utils/utilsApp';
import optionsHelper from './optionsHelper';

export class TokenManagerBase {
  constructor(options, wallet) {
    this.options = options;
    this.wallet = wallet;
    this.tokenChainId = optionsHelper.getChainId(this.options);
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

  getTokenListMetaAsync() {
    return utilsApp.throwToBeImplemented(this);
  }

  getRecommendTokenAddresses() {
    return utilsApp.throwToBeImplemented(this);
  }
}
