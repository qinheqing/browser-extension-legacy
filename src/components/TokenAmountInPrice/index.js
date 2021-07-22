import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import storePrice from '../../store/storePrice';
import utilsNumber from '../../utils/utilsNumber';
import AmountText from '../AmountText';
import styles from './index.css';

function TokenAmountInPrice({ token, value }) {
  const { decimals } = token;
  const price = storePrice.getTokenPrice({ token });
  const amount = utilsNumber.bigNum(value).times(price).toFixed();
  useEffect(() => {
    storePrice.fetchSingleTokenPrice(token);
  }, [token?.contractAddress]);
  return (
    <span>
      <AmountText value={amount} decimals={decimals} precision={2} /> USD
    </span>
  );
}

TokenAmountInPrice.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenAmountInPrice);
