import { isString, isNumber } from 'lodash';
import * as uuidMaker from 'uuid';

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

function shortenAddress(address, { size = 6 } = {}) {
  // TODO if size > address.length
  const head = address.substr(0, size);
  const tail = address.substr(address.length - size);
  return `${head}...${tail}`;
}

export default {
  uuid,
  formatTemplate,
  includeScripts,
  mnemonicToSeed,
  throwToBeImplemented,
  shortenAddress,
};
