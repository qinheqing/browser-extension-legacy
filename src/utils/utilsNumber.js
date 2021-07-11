import BigNumber from 'bignumber.js';
import { isString, isNumber } from 'lodash';

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

function toNormalNumber({ value, decimals, precision, roundMode = 'round' }) {
  if (isNaN(value) || value === '') {
    return NaN;
  }
  const num = new BigNumber(value).div(new BigNumber(10).pow(decimals));
  return num.toFixed(precision, toBnRoundMode(roundMode));
}

export default {
  bigNum,
  toNormalNumber,
  toBnRoundMode,
};
