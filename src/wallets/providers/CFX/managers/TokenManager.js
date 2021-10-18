import { TokenManagerBase } from '../../../TokenManagerBase';

const recommendsTokenKeys = {
  // chainId: { contractAddress: true }
  1029: {
    'cfx:acg158kvr8zanb1bs048ryb6rtrhr283ma70vz70tx': true,
    'cfx:acdrf821t59y12b4guyzckyuw2xf1gfpj2ba0x4sj6': true,
    'cfx:achcuvuasx3t8zcumtwuf35y51sksewvca0h0hj71a': true,
    'cfx:acf2rcsh8payyxpg6xj7b0ztswwh81ute60tsw35j7': true,
    'cfx:aca13suyk7mbgxw9y3wbjn9vd136swu6s21tg67xmb': true,
  },
  1: {
    'cfxtest:achbg8p01fuynegcmvscep9xrsxj28maaj190s6y7n': true,
    'cfxtest:acdegd322pt9chenmhcbe86etxkx07v59as5gk5s0r': true,
    'cfxtest:ace00yhwcv70r6jbf2e1nw6tkrk491w9v27pb95w9n': true,
  },
};

class TokenManager extends TokenManagerBase {
  async getTokenListMetaAsync() {
    const { tokens } = await import('../data/token-list.json');
    const list = tokens.filter(
      (item) => String(item.chainId) === String(this.tokenChainId),
    );
    return list;
  }

  getRecommendTokenAddresses() {
    const keys = recommendsTokenKeys[this.tokenChainId];
    return keys || {};
  }
}

export default TokenManager;
