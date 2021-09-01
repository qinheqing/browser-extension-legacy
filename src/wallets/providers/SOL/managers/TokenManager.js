import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import OneTokenInfo from '../../../../classes/OneTokenInfo';

const recommendsTokenKeys = {
  101: {
    SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: true,
    MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L: true,
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': true,
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': true,
    AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3: true,
    '3JSf5tPeuscJGtaCp5giEiDhv51gQ4v3zWg8DGgyLfAB': true,
    CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG: true,
    Ga2AXHpfAF6mv2ekZwcsJFqu7wB4NV331qNH7fW9Nst8: true,
    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: true,
    BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4: true,
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: true,
    BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW: true,
    AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy: true,
    CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K: true,
    SF3oTvfWzEP3DTwGSvUXRrGTvr75pdZNnBLAH9bzMuX: true,
    BtZQfWqDGbk9Wf2rXEiWyQBdBY1etnUUn6zEphvVS7yN: true,
    '5Fu5UUgbjpUvdBveb3a1JTNirL8rXtiYeSMWvKjtUNQv': true,
    '873KLxCbz7s9Kc4ZzgYRtNmhfkQrhfyWGZJBmyCbC3ei': true,
    HqB7uswoVg4suaQiDP3wjxob1G5WdZ144zhdStwMCq7e: true,
    '9S4t2NEAiJVMvPdRYKVrfJpBafPBLtvbvyS3DecojQHw': true,
    '6WNVCuxCGJzNjmMZoKyhZJwvJ5tYpsLyAtagzYASqBoF': true,
    DJafV9qemGp7mLMEn5wrfqaFwxsbLgUsGVS16zKRk9kc: true,
    DEhAasscXF4kEGxFgJ3bq4PpVGp5wyUxMRvn6TzGVHaw: true,
    GeDS162t9yGJuLEHPWXXGrb1zwkzinCgRwnT8vHYjKza: true,
    GXMvfY2jpQctDqZ9RoU3oWPhufKiCcFEfchvYumtX7jd: true,
    EqWCKXfs3x47uVosDpTRgFniThL9Y8iCztJaapxbEaVX: true,
    EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp: true,
    A6aY2ceogBz1VaXBxm1j2eJuNZMRqrWUAnKecrMH85zj: true,
    '7CnFGR9mZWyAtWxPcVuTewpyC3A3MDW4nLsu5NY6PDbd': true,
    '3GECTP7H4Tww3w8jEPJCJtXUtXxiZty31S9szs84CcwQ': true,
    kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6: true,
    MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb: true,
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': true,
    z3dn17yLaGMKffVogeFHQ9zWVcXgqgf3PQnDsNs2g6M: true,
    '3K6rftdAaQYMPunrtNRHgnK2UAtjm2JwyT2oCiTDouYE': true,
    FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD: true,
    StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT: true,
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
