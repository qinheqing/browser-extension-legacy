import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

import { useSelector } from 'react-redux';
import TokenCell from '../token-cell';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenTracker } from '../../../hooks/useTokenTracker';
import { getAssetImages, getContractMap } from '../../../selectors';
import { getTokensWithBalance, getTokens } from '../../../ducks/metamask/metamask';

export default function TokenList({ onTokenClick }) {
  const t = useI18nContext();
  const assetImages = useSelector(getAssetImages);
  const contractMap = useSelector(getContractMap);
  // use `isEqual` comparison function because the token array is serialized
  // from the background so it has a new reference with each background update,
  // even if the tokens haven't changed
  const tokens = useSelector(getTokens, isEqual);
  const defaultTokensWithBalance = useSelector(getTokensWithBalance, isEqual);
  const { loading, tokensWithBalances } = useTokenTracker(tokens, defaultTokensWithBalance, true);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '250px',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
        }}
      >
        {t('loadingTokens')}
      </div>
    );
  }

  return (
    <div>
      {tokensWithBalances.map((tokenData, index) => {
        tokenData.image = assetImages[tokenData.address] || contractMap[tokenData.address]?.logoURI;
        return <TokenCell key={index} {...tokenData} onClick={onTokenClick} />;
      })}
    </div>
  );
}

TokenList.propTypes = {
  onTokenClick: PropTypes.func.isRequired,
};
