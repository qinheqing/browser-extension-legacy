/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { Semaphore } from 'async-mutex';
import utilsUrl from '../utils/utilsUrl';
import utilsApp from '../utils/utilsApp';
import BaseStore from './BaseStore';
import storeStorage from './storeStorage';
import storeChain from './storeChain';
import storeApp from './storeApp';

/*  coingecko api

# list all coin (coin ids)

https://api.coingecko.com/api/v3/coins/list

[
  { "id":"bitcoin", "symbol":"btc", "name":"Bitcoin" }
  { "id":"solana", "symbol":"sol", "name":"Solana" }
]

# list all fiat currency (vs_currencies)

https://api.coingecko.com/api/v3/simple/supported_vs_currencies

['btc', 'eth', 'usd', 'cny']

# list all platform which issue tokens

https://api.coingecko.com/api/v3/asset_platforms

[
  {"id":"solana","chain_identifier":null,"name":"Solana","shortname":""}
  {"id":"binance-smart-chain","chain_identifier":56,"name":"Binance Smart Chain","shortname":"BSC"}
]

# get coin price

https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin&vs_currencies=usd,cny&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true

{
  "solana":{
    "usd":30.98,"usd_market_cap":8474612022.806003,"usd_24h_vol":476280865.7456335,"usd_24h_change":7.567819671750593,
    "cny":200.35,"cny_market_cap":54811248179.902336,"cny_24h_vol":3080600356.9113207,"cny_24h_change":7.423874407480362,
    "last_updated_at":1626316083
  }
}

# get token price

https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82,0x9c65ab58d8d978db963e63f2bfb7121627e3a739&vs_currencies=usd,cny&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true

{
  // CAKE
  '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82': {
    usd: 13.98,
    usd_market_cap: 2739197661.5990973,
    usd_24h_vol: 214466880.4148443,
    usd_24h_change: 0.4811968500529878,
    cny: 90.46,
    cny_market_cap: 17719595753.118362,
    cny_24h_vol: 1387364802.715588,
    cny_24h_change: 0.36173521651947066,
    last_updated_at: 1626316977,
  },
}

https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt&vs_currencies=usd,cny&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true

https://api.coingecko.com/api/v3/coins/serum

*/

// https://github.com/miscavage/CoinGecko-API

const priceFetchSemaphore = new Semaphore(1);

async function coinGeckoFetch({ url, query, method = 'GET' }) {
  let _url = url.replace(/^\//giu, '');
  _url = utilsUrl.addQuery({
    url: `https://api.coingecko.com/${_url}`,
    query,
  });
  return await priceFetchSemaphore.runExclusive(() =>
    fetch(_url, {
      method,
    }).catch((err) => {
      // noop
      err.IS_MUTE_NOTIFY = true;
      throw err;
    }),
  );
}

function coinGeckoGet(url, query) {
  return coinGeckoFetch({
    url,
    query,
  });
}

class StorePrice extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  _buildTokenPriceKey(token) {
    const { isNative, tokenId, contractAddress, platformId, decimals } = token;
    const _tokenId = tokenId || token?.extensions?.coingeckoId;
    if (_tokenId) {
      return _tokenId;
    }
    return `${platformId} => ${contractAddress}`;
  }

  getTokenPriceInfo(token) {
    const key = this._buildTokenPriceKey(token);
    return storeStorage.tokenPricesRaw?.[key] || {};
  }

  getTokenPrice({ token }) {
    const { currentCurrency } = storeApp;
    const currency = currentCurrency.toLowerCase();
    return this.getTokenPriceInfo(token)?.[currency] || 0;
  }

  // TODO add throttle update
  @action.bound
  _updatePricesMap(pricesMap = {}, tokens) {
    // eslint-disable-next-line no-param-reassign
    tokens = [].concat(tokens);
    const pricesMapNew = {};
    Object.entries(pricesMap).forEach(
      ([contractAddressOrTokenId, priceInfo]) => {
        const tokenInfo = tokens.find(
          (t) =>
            t.contractAddress === contractAddressOrTokenId ||
            t.tokenId === contractAddressOrTokenId,
        );
        if (tokenInfo) {
          const priceKey = this._buildTokenPriceKey(tokenInfo);
          pricesMapNew[priceKey] = {
            ...priceInfo,
            lastUpdate: new Date().getTime(),
            tokenInfo: {
              // name: tokenInfo?.name, // name is meaningful, as different platform has different name
              symbol: tokenInfo?.symbol,
            },
          };
        }
      },
    );

    storeStorage.tokenPricesRaw = {
      ...storeStorage.tokenPricesRaw,
      ...pricesMapNew,
    };
  }

  async fetchAllPrices(tokens = []) {
    const nativeToken = tokens.find((item) => item.isNative);
    const _tokens = tokens.filter((item) => !item.isNative);
    return Promise.all([
      this.fetchNativeTokenPrice(nativeToken),
      this.fetchBatchTokensPrice(_tokens),
    ]);
  }

  async fetchNativeTokenPrice(nativeToken) {
    const { tokenId } = nativeToken;

    if (!tokenId) {
      return;
    }

    // cache 5 min
    if (!this._isTokenPriceExpired(nativeToken)) {
      return;
    }

    const data = await coinGeckoGet('/api/v3/simple/price', {
      ids: [tokenId],
      // TODO check MM currency setting and coingecko supported_vs_currencies
      vs_currencies: ['cny', 'usd'],
    });

    /*
      {
        solana: { cny: 194.65, usd: 30.13 }
        [tokenId]: { cny: 194.65, usd: 30.13 }
      }
    */
    const pricesMap = await data.json();
    if (pricesMap.error) {
      console.error(pricesMap.error);
      return;
    }
    this._updatePricesMap(pricesMap, nativeToken);
  }

  // batch fetch price by contractAddress
  async fetchBatchTokensPrice(tokens) {
    const platformId = storeChain.currentChainInfo?.platformId;
    const contractAddresses = tokens.map((t) => t.contractAddress);

    if (!contractAddresses.length || !platformId) {
      return;
    }
    // const platformId = 'binance-smart-chain';
    // const contractAddresses = [
    //   '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    //   '0x9c65ab58d8d978db963e63f2bfb7121627e3a739',
    // ];
    const data = await coinGeckoGet(
      `/api/v3/simple/token_price/${platformId}`,
      {
        contract_addresses: contractAddresses,
        // TODO check MM currency setting and coingecko supported_vs_currencies
        vs_currencies: ['cny', 'usd'],
      },
    );

    /*
      {
        '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82': { cny: 89.0, usd: 13.78 },
        [contractAddr]: { cny: 89.0, usd: 13.78 },
      }
     */
    const pricesMap = await data.json();
    if (pricesMap.error) {
      console.error(pricesMap.error);
      return;
    }
    this._updatePricesMap(pricesMap, tokens);
  }

  // single fetch price by tokenId (coingeckoId)
  async fetchSingleTokenPrice(token) {
    // eslint-disable-next-line prefer-const
    let { contractAddress, tokenId } = token;
    tokenId = tokenId || token?.extensions?.coingeckoId;
    if (!tokenId) {
      return;
    }

    // cache 5 min
    if (!this._isTokenPriceExpired(token)) {
      return;
    }
    // TODO use /api/v3/simple/price and merge with fetchNativeTokenPrice
    //    https://api.coingecko.com/api/v3/simple/price?ids=solana,akropolis&vs_currencies=cny%2Cusd
    const data = await coinGeckoGet(`/api/v3/coins/${tokenId}`);
    const tokenData = await data.json();
    if (tokenData.error) {
      console.error(tokenData.error);
      return;
    }
    const priceInfo = tokenData?.market_data?.current_price;
    if (priceInfo) {
      const { cny, usd } = priceInfo;
      this._updatePricesMap(
        {
          [tokenId]: { cny, usd },
        },
        token,
      );
    }
  }

  _isTokenPriceExpired(token) {
    const priceInfo = this.getTokenPriceInfo(token);
    if (
      !priceInfo.lastUpdate ||
      priceInfo.lastUpdate < new Date().getTime() - 5 * 60 * 1000
    ) {
      return true;
    }
    return false;
  }
}

global._storePrice = new StorePrice();
export default global._storePrice;
