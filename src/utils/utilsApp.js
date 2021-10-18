import {
  isString,
  isNumber,
  isNil,
  isEmpty,
  isArray,
  isPlainObject,
  isBoolean,
  isDate,
} from 'lodash';
import * as uuidMaker from 'uuid';
import * as changeCase from 'change-case';
import { getEnvironmentType } from '../../app/scripts/lib/util';
import {
  ENVIRONMENT_TYPE_BACKGROUND,
  ENVIRONMENT_TYPE_POPUP,
} from '../../shared/constants/app';
import utilsStorage from './utilsStorage';

function uuid() {
  return uuidMaker.v4().replace(/-/giu, '');
}

function bufferToHex(bytes, { prefix = '0x' } = {}) {
  return prefix + Buffer.from(bytes).toString('hex');
}

async function mnemonicToSeed(mnemonic) {
  const bip39 = await import('bip39');
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return bufferToHex(seed, { prefix: '' });
}

function includeScripts(src) {
  const script = document.createElement('script');
  script.src = src;
  document.head.appendChild(script);
}

function formatTemplate(template, data, notFoundStr = undefined) {
  const _data = data || {};
  const pattern = /\{\{\s*(.+?)\s*\}\}/gu;
  // const pattern = /\{\s*(.+?)\s*\}/g;
  return template.replace(pattern, (fullString, match1, match2) => {
    let value = _data[match1];
    // if value not found in data,
    // replace to notFoundStr or original template fullString {{key}}
    if (value === undefined || value === null) {
      value = notFoundStr === undefined ? fullString : notFoundStr;
    }

    // TODO use bignumber to deal with Number
    return isString(value) || isNumber(value) ? String(value) : fullString;
  });
}

function throwToBeImplemented(cls) {
  throw new Error(`method need to be implemented at [${cls.constructor.name}]`);
}

function shortenAddress(
  address = '',
  { size = 6, head = true, tail = true } = {},
) {
  // eslint-disable-next-line no-param-reassign
  address = address || '';
  // TODO if size > address.length
  const headStr = head ? address.substr(0, size) : '';
  const tailStr = tail ? address.substr(address.length - size) : '';
  return `${headStr}...${tailStr}`;
}

function isPopupEnvironment() {
  return getEnvironmentType() === ENVIRONMENT_TYPE_POPUP;
}

function isBackgroundEnvironment() {
  return getEnvironmentType() === ENVIRONMENT_TYPE_BACKGROUND;
}

function isUiEnvironment() {
  return !isBackgroundEnvironment();
}

function openStandalonePage(routeUrl) {
  if (isPopupEnvironment()) {
    global.platform.openExtensionInBrowser(routeUrl);
  } else {
    global.onekeyHistory.push(routeUrl);
  }
}

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

async function waitForDataLoaded({ data, log }) {
  const getDataArrFunc = [].concat(data);
  // TODO timeout break
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let isAllLoaded = true;

    if (log) {
      console.log(`waitForDataLoaded: ${log}`);
    } else {
      console.log('waitForDataLoaded');
    }

    getDataArrFunc.forEach((getData) => {
      const d = getData();
      if (d === false) {
        isAllLoaded = false;
      }

      if (isNil(d)) {
        isAllLoaded = false;
      }

      if (isEmpty(d)) {
        if (isPlainObject(d) || isArray(d)) {
          isAllLoaded = false;
        }
      }
    });

    if (isAllLoaded) {
      break;
    }
    await delay(600);
  }
}

function reactSafeRender(content, { tryToString = true, ...others } = {}) {
  // Error
  // Objects are not valid as a React child (found: object with keys {hello}). If you meant to render a collection of children, use an array instead.
  // render object will fail, and can NOT catch.
  //        <div> { {name:1} } </div>

  const options = {
    tryToString,
    ...others,
  };
  let safeRenderStr = content;
  if (isArray(safeRenderStr)) {
    return safeRenderStr.map((item) => reactSafeRender(item, options));
  }

  if (tryToString && safeRenderStr?.toString) {
    safeRenderStr = safeRenderStr.toString();
  }

  if (isString(safeRenderStr) || isNumber(safeRenderStr)) {
    return safeRenderStr;
  }
  // render to null types:
  //    Boolean, NaN, null, undefined

  // CAN NOT render types:
  //    PlainObject, Date, Regex, Function (warning only)
  console.warn(
    'reactSafeRenderChildren() is an [Object], please check your code',
    content,
  );
  return null;
}

function isNewHome() {
  return utilsStorage.getAutoSaveLocalStorageItem('homeType') === 'NEW';
}

function isOldHome() {
  return !isNewHome();
}

function objectToUint8Array(dataObj = {}) {
  const data = new Uint8Array(Object.keys(dataObj).length);
  for (const [index, value] of Object.entries(dataObj)) {
    data[index] = value;
  }
  return data;
}

function trackEventNoop() {
  return new Promise((resolve) => resolve());
}

export default {
  uuid,
  formatTemplate,
  includeScripts,
  mnemonicToSeed,
  throwToBeImplemented,
  shortenAddress,
  openStandalonePage,
  isPopupEnvironment,
  isBackgroundEnvironment,
  isUiEnvironment,
  isNewHome,
  isOldHome,
  waitForDataLoaded,
  delay,
  changeCase,
  reactSafeRender,
  objectToUint8Array,
  trackEventNoop,
  bufferToHex,
};
