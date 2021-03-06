import { cloneDeep } from 'lodash';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import { getStorageItem, setStorageItem } from '../../../lib/storage-helpers';
import {
  decGWEIToHexWEI,
  getValueFromWeiHex,
} from '../../helpers/utils/conversions.util';
import getFetchWithTimeout from '../../../../shared/modules/fetch-with-timeout';
import { getIsMainnet, getCurrentChainId } from '../../selectors';

const fetchWithTimeout = getFetchWithTimeout(30000);

// Actions
const BASIC_GAS_ESTIMATE_LOADING_FINISHED =
  'metamask/gas/BASIC_GAS_ESTIMATE_LOADING_FINISHED';
const BASIC_GAS_ESTIMATE_LOADING_STARTED =
  'metamask/gas/BASIC_GAS_ESTIMATE_LOADING_STARTED';
const RESET_CUSTOM_GAS_STATE = 'metamask/gas/RESET_CUSTOM_GAS_STATE';
const RESET_CUSTOM_DATA = 'metamask/gas/RESET_CUSTOM_DATA';
const SET_BASIC_GAS_ESTIMATE_DATA = 'metamask/gas/SET_BASIC_GAS_ESTIMATE_DATA';
const SET_CUSTOM_GAS_LIMIT = 'metamask/gas/SET_CUSTOM_GAS_LIMIT';
const SET_CUSTOM_GAS_PRICE = 'metamask/gas/SET_CUSTOM_GAS_PRICE';
const SET_BASIC_PRICE_ESTIMATES_LAST_RETRIEVED =
  'metamask/gas/SET_BASIC_PRICE_ESTIMATES_LAST_RETRIEVED';

const initState = {
  customData: {
    price: null,
    limit: null,
  },
  basicEstimates: {
    safeLow: null,
    average: null,
    fast: null,
  },
  basicEstimateIsLoading: true,
  basicPriceEstimatesLastRetrieved: 0,
};

// Reducer
export default function reducer(state = initState, action) {
  switch (action.type) {
    case BASIC_GAS_ESTIMATE_LOADING_STARTED:
      return {
        ...state,
        basicEstimateIsLoading: true,
      };
    case BASIC_GAS_ESTIMATE_LOADING_FINISHED:
      return {
        ...state,
        basicEstimateIsLoading: false,
      };
    case SET_BASIC_GAS_ESTIMATE_DATA:
      return {
        ...state,
        basicEstimates: action.value,
      };
    case SET_CUSTOM_GAS_PRICE:
      return {
        ...state,
        customData: {
          ...state.customData,
          price: action.value,
        },
      };
    case SET_CUSTOM_GAS_LIMIT:
      return {
        ...state,
        customData: {
          ...state.customData,
          limit: action.value,
        },
      };
    case SET_BASIC_PRICE_ESTIMATES_LAST_RETRIEVED:
      return {
        ...state,
        basicPriceEstimatesLastRetrieved: action.value,
      };
    case RESET_CUSTOM_DATA:
      return {
        ...state,
        customData: cloneDeep(initState.customData),
      };
    case RESET_CUSTOM_GAS_STATE:
      return cloneDeep(initState);
    default:
      return state;
  }
}

// Action Creators
export function basicGasEstimatesLoadingStarted() {
  return {
    type: BASIC_GAS_ESTIMATE_LOADING_STARTED,
  };
}

export function basicGasEstimatesLoadingFinished() {
  return {
    type: BASIC_GAS_ESTIMATE_LOADING_FINISHED,
  };
}

async function basicGasPriceQuery() {
  const url0 = `https://www.gasnow.org/api/v3/gas/price`;
  return fetchWithTimeout(url0, {
    headers: {},
    referrer: 'https://www.gasnow.org',
    referrerPolicy: 'no-referrer-when-downgrade',
    body: null,
    method: 'GET',
    mode: 'cors',
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.code === 200) {
        const { data } = json;
        const result = {
          FastGasPrice: `${Math.floor(data.rapid / 10 ** 9)}`,
          ProposeGasPrice: `${Math.floor(data.fast / 10 ** 9)}`,
          SafeGasPrice: `${Math.floor(data.standard / 10 ** 9)}`,
        };
        return result;
      }
      throw new Error(json);
    })
    .catch(async () => {
      const url = `https://api.metaswap.codefi.network/gasPrices`;
      return await fetchWithTimeout(url, {
        headers: {},
        referrer: 'https://api.metaswap.codefi.network/gasPrices',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: null,
        method: 'GET',
        mode: 'cors',
      }).then((metaRes) => metaRes.json());
    });
}

export function fetchBasicGasEstimates() {
  return async (dispatch, getState) => {
    const isMainnet = getIsMainnet(getState());
    const { basicPriceEstimatesLastRetrieved } = getState().gas;

    const timeLastRetrieved =
      basicPriceEstimatesLastRetrieved ||
      (await getStorageItem('BASIC_PRICE_ESTIMATES_LAST_RETRIEVED')) ||
      0;

    dispatch(basicGasEstimatesLoadingStarted());

    let basicEstimates;
    if (isMainnet || process.env.IN_TEST) {
      if (Date.now() - timeLastRetrieved > 75000) {
        basicEstimates = await fetchExternalBasicGasEstimates(dispatch);
      } else {
        const cachedBasicEstimates = await getStorageItem(
          'BASIC_PRICE_ESTIMATES',
        );
        basicEstimates =
          cachedBasicEstimates ||
          (await fetchExternalBasicGasEstimates(dispatch));
      }
    } else {
      basicEstimates = await fetchEthGasPriceEstimates(getState());
    }

    dispatch(setBasicGasEstimateData(basicEstimates));
    dispatch(basicGasEstimatesLoadingFinished());

    return basicEstimates;
  };
}

async function fetchExternalBasicGasEstimates(dispatch) {
  const { SafeGasPrice, ProposeGasPrice, FastGasPrice } =
    await basicGasPriceQuery();

  const [safeLow, average, fast] = [
    SafeGasPrice,
    ProposeGasPrice,
    FastGasPrice,
  ].map((price) => new BigNumber(price, 10).toNumber());

  const basicEstimates = {
    safeLow,
    average,
    fast,
  };

  const timeRetrieved = Date.now();
  await Promise.all([
    setStorageItem('BASIC_PRICE_ESTIMATES', basicEstimates),
    setStorageItem('BASIC_PRICE_ESTIMATES_LAST_RETRIEVED', timeRetrieved),
  ]);
  dispatch(setBasicPriceEstimatesLastRetrieved(timeRetrieved));
  return basicEstimates;
}

async function fetchEthGasPriceEstimates(state) {
  const chainId = getCurrentChainId(state);
  const [cachedTimeLastRetrieved, cachedBasicEstimates] = await Promise.all([
    getStorageItem(`${chainId}_BASIC_PRICE_ESTIMATES_LAST_RETRIEVED`),
    getStorageItem(`${chainId}_BASIC_PRICE_ESTIMATES`),
  ]);
  const timeLastRetrieved = cachedTimeLastRetrieved || 0;
  if (cachedBasicEstimates && Date.now() - timeLastRetrieved < 75000) {
    return cachedBasicEstimates;
  }
  let gasPrice = await global.eth.gasPrice();
  gasPrice = gasPrice ?? new BN(0, 10);
  const numberOfDecimals = gasPrice.toNumber() > 10 ** 9 ? 4 : 7;
  const averageGasPriceInDecGWEI = getValueFromWeiHex({
    value: gasPrice.toString(16),
    numberOfDecimals,
    toDenomination: 'GWEI',
  });
  const basicEstimates = {
    safeLow: Number(averageGasPriceInDecGWEI),
    average: Number(averageGasPriceInDecGWEI),
    fast: Number(averageGasPriceInDecGWEI),
  };
  const timeRetrieved = Date.now();

  await Promise.all([
    setStorageItem(`${chainId}_BASIC_PRICE_ESTIMATES`, basicEstimates),
    setStorageItem(
      `${chainId}_BASIC_PRICE_ESTIMATES_LAST_RETRIEVED`,
      timeRetrieved,
    ),
  ]);

  return basicEstimates;
}

export function setCustomGasPriceForRetry(newPrice) {
  return async (dispatch) => {
    if (newPrice === '0x0') {
      const estimates = await getStorageItem('BASIC_PRICE_ESTIMATES');
      const fast = (estimates && estimates.fast) || 10;
      dispatch(setCustomGasPrice(decGWEIToHexWEI(fast)));
    } else {
      dispatch(setCustomGasPrice(newPrice));
    }
  };
}

export function setBasicGasEstimateData(basicGasEstimateData) {
  return {
    type: SET_BASIC_GAS_ESTIMATE_DATA,
    value: basicGasEstimateData,
  };
}

export function setCustomGasPrice(newPrice) {
  return {
    type: SET_CUSTOM_GAS_PRICE,
    value: newPrice,
  };
}

export function setCustomGasLimit(newLimit) {
  return {
    type: SET_CUSTOM_GAS_LIMIT,
    value: newLimit,
  };
}

export function setBasicPriceEstimatesLastRetrieved(retrievalTime) {
  return {
    type: SET_BASIC_PRICE_ESTIMATES_LAST_RETRIEVED,
    value: retrievalTime,
  };
}

export function resetCustomGasState() {
  return { type: RESET_CUSTOM_GAS_STATE };
}

export function resetCustomData() {
  return { type: RESET_CUSTOM_DATA };
}
