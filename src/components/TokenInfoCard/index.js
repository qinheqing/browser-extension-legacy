import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import TokenBalance from '../TokenBalance';
import OneCellItem from '../OneCellItem';
import { TokenLogoIcon } from '../LogoIcon';

function TokenInfoCard({ token, onClick, maskAssetBalance = false }) {
  const { symbol } = token;
  const { name, icon } = token;
  const tokenName = token.symbolOrName || token.contractAddressShort;

  return (
    <OneCellItem
      data-contract-address={token.contractAddress || ''}
      className="px-4"
      onClick={onClick}
      start={<TokenLogoIcon tokenInfo={token} className="" />}
      end={
        <div className="text-right">
          <TokenBalance
            className="text-base text-gray-900"
            tokenInfo={token}
            watchBalanceChange
            showPrice
            maskAssetBalance={maskAssetBalance}
            classNamePrice="text-xs text-gray-400"
          />
        </div>
      }
      title={
        <div className="text-lg relative" onClick={() => console.log(token)}>
          {tokenName}
          <small className="absolute text-xs text-gray-300 left-0 top-full -mt-1 ">
            {symbol ? name : token.contractAddressShort}
          </small>
        </div>
      }
    />
  );
}

TokenInfoCard.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenInfoCard);
