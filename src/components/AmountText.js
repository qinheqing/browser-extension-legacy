import React from 'react';
import BigNumber from 'bignumber.js';
import utilsNumber from '../utils/utilsNumber';
// import styles from './AmountText.css';

// eslint-disable-next-line react/prop-types
export default function AmountText({
  value,
  decimals = 0,
  precision = Infinity, // TODO read from chainInfo config
  roundMode = 'round', // floor,ceil,round
}) {
  const num = utilsNumber.toNormalNumber({
    value,
    decimals,
    precision,
    roundMode,
  });
  return (
    <span data-value={value} data-decimals={decimals}>
      {num}
    </span>
  );
}
