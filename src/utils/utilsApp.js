import {
  isString,
  isNumber,
  isNil,
  isEmpty,
  isArray,
  isPlainObject,
} from 'lodash';
import * as uuidMaker from 'uuid';
import copyToClipboard from 'copy-to-clipboard';
import { getEnvironmentType } from '../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../shared/constants/app';
import { CONNECT_HARDWARE_ROUTE } from '../../ui/app/helpers/constants/routes';

function uuid() {
  return uuidMaker.v4().replace(/-/giu, '');
}

async function mnemonicToSeed(mnemonic) {
  const bip39 = await import('bip39');
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString('hex');
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
  // TODO if size > address.length
  const headStr = head ? address.substr(0, size) : '';
  const tailStr = tail ? address.substr(address.length - size) : '';
  return `${headStr}...${tailStr}`;
}

function isExtensionTypePopup() {
  return getEnvironmentType() === ENVIRONMENT_TYPE_POPUP;
}

function openStandalonePage(routeUrl) {
  if (isExtensionTypePopup()) {
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

export default {
  uuid,
  formatTemplate,
  includeScripts,
  mnemonicToSeed,
  throwToBeImplemented,
  shortenAddress,
  openStandalonePage,
  isExtensionTypePopup,
  waitForDataLoaded,
  delay,
};
