import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

import { useSelector } from 'react-redux';
import TokenCell from '../token-cell';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenTracker } from '../../../hooks/useTokenTracker';
import { getAssetImages, getContractMap } from '../../../selectors';
import {
  getTokensWithBalance,
  getTokens,
} from '../../../ducks/metamask/metamask';
import LoadingSpinner from '../../../../../src/components/LoadingSpinner';

export default function TokenList({ onTokenClick, newTheme }) {
  const t = useI18nContext();
  const assetImages = useSelector(getAssetImages);
  const contractMap = useSelector(getContractMap);
  // use `isEqual` comparison function because the token array is serialized
  // from the background so it has a new reference with each background update,
  // even if the tokens haven't changed
  const tokens = useSelector(getTokens, isEqual);
  const defaultTokensWithBalance = useSelector(getTokensWithBalance, isEqual);
  const { loading, tokensWithBalances } = useTokenTracker(
    tokens,
    defaultTokensWithBalance,
    true,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <LoadingSpinner className="w-8" />
        <div className="mt-2 text-sm text-gray-400">{t('loadingTokens')}</div>
      </div>
    );
  }

  return (
    <>
      {tokensWithBalances.map((tokenData, index) => {
        const image =
          assetImages[tokenData.address] ||
          contractMap[tokenData.address]?.logoURI;
        tokenData.image = image;
        return (
          <TokenCell
            newTheme={newTheme}
            key={index}
            {...tokenData}
            onClick={onTokenClick}
          />
        );
      })}
    </>
  );
}

TokenList.propTypes = {
  onTokenClick: PropTypes.func.isRequired,
  newTheme: PropTypes.bool,
};
