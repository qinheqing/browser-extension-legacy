import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AssetListItem from '../asset-list-item';
import { getSelectedAddress, getCurrentChainId } from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenFiatAmount } from '../../../hooks/useTokenFiatAmount';
import { getEtherscanNetwork } from '../../../../lib/etherscan-prefix-for-network';
import storeStorage from '../../../../../src/store/storeStorage';
import TokenInfoCard from '../../../../../src/components/TokenInfoCard';
import useCurrentChainInfo from '../../../../../src/hooks/useCurrentChainInfo';
import { updateSendToken } from '../../../store/actions';

export default function TokenCell({
  address,
  decimals,
  balanceError,
  symbol,
  string,
  image,
  onClick,
  newTheme,
}) {
  const userAddress = useSelector(getSelectedAddress);
  const chainId = useSelector(getCurrentChainId);
  const t = useI18nContext();
  const prefix = getEtherscanNetwork(chainId) || 'https://ethplorer.io';
  const chainInfo = useCurrentChainInfo();
  const dispatch = useDispatch();

  const formattedFiat = useTokenFiatAmount(address, string, symbol);

  const warning = balanceError ? (
    <span>
      {t('troubleTokenBalances')}
      <a
        href={`${prefix}/address/${userAddress}`}
        rel="noopener noreferrer"
        target="_blank"
        onClick={(event) => event.stopPropagation()}
        style={{ color: '#F7861C' }}
      >
        {t('here')}
      </a>
    </span>
  ) : null;

  if (newTheme) {
    return (
      <TokenInfoCard
        onClick={() => {
          // dispatch(
          //   updateSendToken({
          //     address,
          //     decimals,
          //     symbol,
          //   }),
          // );
          onClick(address);
        }}
        maskAssetBalance={storeStorage.maskAssetBalance}
        chainInfo={chainInfo}
        token={{
          symbol,
          name: symbol,
          icon: image,
          contractAddress: address,
        }}
        title={
          <div>
            {`${string || 0}`} {symbol}
          </div>
        }
        content={<div>{formattedFiat || '--'}</div>}
      />
    );
  }

  return (
    <AssetListItem
      className={classnames('token-cell', {
        'token-cell--outdated': Boolean(balanceError),
      })}
      iconClassName="token-cell__icon"
      onClick={onClick.bind(null, address)}
      tokenAddress={address}
      tokenImage={image}
      tokenSymbol={symbol}
      tokenDecimals={decimals}
      warning={warning}
      primary={`${string || 0}`}
      secondary={formattedFiat}
    />
  );
}

TokenCell.propTypes = {
  address: PropTypes.string,
  balanceError: PropTypes.object,
  symbol: PropTypes.string,
  decimals: PropTypes.number,
  string: PropTypes.string,
  image: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  newTheme: PropTypes.bool,
};

TokenCell.defaultProps = {
  balanceError: null,
};
