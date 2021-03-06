import React from 'react';
import BigNumber from 'bignumber.js';
import utilsNumber from '../utils/utilsNumber';
// import styles from './AmountText.css';

// eslint-disable-next-line react/prop-types
export default function AmountText({
  value,
  decimals = 0,
  precision = 8, // TODO read from chainInfo config
  roundMode = 'round', // floor,ceil,round
  unit = '',
}) {
  const num = utilsNumber.toNormalNumber({
    value,
    decimals,
    precision,
    roundMode,
  });
  return (
    <span data-value={isNaN(value) ? 'NaN' : value} data-decimals={decimals}>
      {num}
      {unit && <span> {unit}</span>}
    </span>
  );
}
