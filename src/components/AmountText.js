import React from 'react';
import BigNumber from 'bignumber.js';
// import styles from './AmountText.css';

// eslint-disable-next-line react/prop-types
export default function AmountText({
  value,
  decimals = 0,
  precision = 8,
  round = 'round', // floor,ceil,round
}) {
  const value1 = value || '0';
  const num = new BigNumber(value1).div(new BigNumber(10).pow(decimals));
  // console.log(styles.container);
  return num.toFixed(precision);
}
