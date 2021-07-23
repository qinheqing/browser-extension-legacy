import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';
import TokenBalance from '../TokenBalance';
import utilsApp from '../../utils/utilsApp';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import storeTransfer from '../../store/storeTransfer';
import { ROUTE_TRANSFER } from '../../routes/routeUrls';
import TokenIcon from '../TokenIcon';
import storeHistory from '../../store/storeHistory';
import storeStorage from '../../store/storeStorage';
import OneCellItem from '../OneCellItem';
import storeToken from '../../store/storeToken';

function TokenInfoCard({ token, onClick, maskAssetBalance = false }) {
  const { symbol } = token;
  const { name, icon } = token;
  const tokenName = token.symbolOrName || token.contractAddressShort;

  return (
    <OneCellItem
      className="px-4"
      onClick={onClick}
      start={<TokenIcon tokenInfo={token} className="" />}
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
          <small
            data-contract-address={token.contractAddress}
            className="absolute text-xs text-gray-300 left-0 top-full -mt-1 "
          >
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
