import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AddTokenButton from '../add-token-button';
import TokenList from '../token-list';
import { ADD_TOKEN_ROUTE } from '../../../helpers/constants/routes';
import AssetListItem from '../asset-list-item';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import { useTrackEvent } from '../../../hooks/useTrackEvent';
import { useUserPreferencedCurrency } from '../../../hooks/useUserPreferencedCurrency';
import {
  getCurrentAccountWithSendEtherInfo,
  getNativeCurrency,
  getShouldShowFiat,
  getEtherLogo,
} from '../../../selectors';
import { useCurrencyDisplay } from '../../../hooks/useCurrencyDisplay';
import useCurrentChainInfo from '../../../../../src/hooks/useCurrentChainInfo';
import TokenInfoCard from '../../../../../src/components/TokenInfoCard';
import storeStorage from '../../../../../src/store/storeStorage';

const AssetList = ({ onClickAsset }) => {
  const history = useHistory();
  const selectedAccountBalance = useSelector(
    (state) => getCurrentAccountWithSendEtherInfo(state).balance,
  );
  const chainInfo = useCurrentChainInfo();
  const nativeCurrency = useSelector(getNativeCurrency);
  const showFiat = useSelector(getShouldShowFiat);
  const providerImage = useSelector(getEtherLogo);
  const selectTokenEvent = useTrackEvent({
    eventOpts: {
      category: 'Navigation',
      action: 'Token Menu',
      name: 'Clicked Token',
    },
  });
  const addTokenEvent = useTrackEvent({
    eventOpts: {
      category: 'Navigation',
      action: 'Token Menu',
      name: 'Clicked "Add Token"',
    },
  });

  const {
    currency: primaryCurrency,
    numberOfDecimals: primaryNumberOfDecimals,
  } = useUserPreferencedCurrency(PRIMARY, { ethNumberOfDecimals: 4 });
  const {
    currency: secondaryCurrency,
    numberOfDecimals: secondaryNumberOfDecimals,
  } = useUserPreferencedCurrency(SECONDARY, { ethNumberOfDecimals: 4 });

  const [, primaryCurrencyProperties] = useCurrencyDisplay(
    selectedAccountBalance,
    {
      numberOfDecimals: primaryNumberOfDecimals,
      currency: primaryCurrency,
    },
  );

  const [secondaryCurrencyDisplay] = useCurrencyDisplay(
    selectedAccountBalance,
    {
      numberOfDecimals: secondaryNumberOfDecimals,
      currency: secondaryCurrency,
    },
  );

  const nativeTokenItem = (
    <TokenInfoCard
      onClick={() => onClickAsset(nativeCurrency)}
      maskAssetBalance={storeStorage.maskAssetBalance}
      chainInfo={chainInfo}
      token={{
        symbol: primaryCurrencyProperties.suffix,
        name: primaryCurrencyProperties.suffix,
        icon: providerImage,
        contractAddress: '',
      }}
      title={
        <div>
          {primaryCurrencyProperties.value} {primaryCurrencyProperties.suffix}
        </div>
      }
      content={<div>{showFiat ? secondaryCurrencyDisplay : undefined}</div>}
    />
  );
  const nativeTokenItemLegacy = (
    <AssetListItem
      onClick={() => onClickAsset(nativeCurrency)}
      data-testid="wallet-balance"
      tokenImage={providerImage}
      primary={primaryCurrencyProperties.value}
      tokenSymbol={primaryCurrencyProperties.suffix}
      secondary={showFiat ? secondaryCurrencyDisplay : undefined}
    />
  );

  return (
    <>
      {/* Native Token Item */}
      {nativeTokenItem}
      {/* {nativeTokenItemLegacy}*/}

      {/* ERC20 Token List */}
      <TokenList
        newTheme
        onTokenClick={(tokenAddress) => {
          onClickAsset(tokenAddress);
          selectTokenEvent();
        }}
      />
      {/* <TokenList*/}
      {/*  onTokenClick={(tokenAddress) => {*/}
      {/*    onClickAsset(tokenAddress);*/}
      {/*    selectTokenEvent();*/}
      {/*  }}*/}
      {/* />*/}
    </>
  );
};

AssetList.propTypes = {
  onClickAsset: PropTypes.func.isRequired,
};

export default AssetList;
