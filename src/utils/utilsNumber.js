import BigNumber from 'bignumber.js';
import { isString, isNumber, isBoolean } from 'lodash';

// like: Math.round     1.1->1, 1.9->2, -1.1->-1, -1.9->-2
export const { ROUND_HALF_UP } = BigNumber;
// like: Math.floor  1.1->1, 1.9->1, -1.1->-2, -1.9->-2
export const { ROUND_FLOOR } = BigNumber;
// like: Math.ceil   1.1->2, 1.9->2, -1.1->-1, -1.9->-1
export const { ROUND_CEIL } = BigNumber;
// 1.1->2, 1.9->2, -1.1->-2, -1.9->-2
export const { ROUND_UP } = BigNumber;
//  1.1->1, 1.9->1, -1.1->-1, -1.9->-1
export const { ROUND_DOWN } = BigNumber;

// always mute error, otherwise will cause application crash if number is invalid
BigNumber.config({ ERRORS: false });

function bigNum(value) {
  return new BigNumber(value);
}

function toBnRoundMode(round) {
  let _round = round;
  if (isString(_round)) {
    switch (_round) {
      case 'round':
        _round = ROUND_HALF_UP;
        break;
      case 'ceil':
        _round = ROUND_CEIL;
        break;
      case 'floor':
        _round = ROUND_FLOOR;
        break;
      default:
        throw new Error(`formatNumber round param is Error: ${_round}`);
    }
  }
  return _round;
}

function isValidNumber(value) {
  return !bigNum(value).isNaN();
}

function parseUnits(value, decimals) {
  return bigNum(10).pow(decimals).times(value).toFixed();
}

function toNormalNumber({
  value,
  decimals = 0,
  precision,
  roundMode = 'round',
  nanText = '-',
}) {
  const num = bigNum(value).div(bigNum(10).pow(decimals));
  if (num.isNaN()) {
    return nanText;
  }
  const numStr = num.toFixed(precision, toBnRoundMode(roundMode));
  if (numStr === 'NaN') {
    return nanText;
  }

  if (num.equals(0)) {
    return '0';
  }
  return numStr;
}

function hexToIntString(hex) {
  return bigNum(parseInt(hex, 16)).toFixed();
}

const utilsNumber = {
  bigNum,
  isValidNumber,
  toNormalNumber,
  parseUnits,
  toBnRoundMode,
  hexToIntString,
};

global._utilsNumber = utilsNumber;
export default utilsNumber;
