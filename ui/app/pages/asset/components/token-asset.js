import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import TransactionList from '../../../components/app/transaction-list';
import { TokenOverview } from '../../../components/app/wallet-overview';
import {
  deprecatedGetCurrentNetworkId,
  getCurrentChainId,
  getSelectedIdentity,
} from '../../../selectors';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { showModal } from '../../../store/actions';

import getAccountLink from '../../../../lib/account-link';
import AssetNavigation from './asset-navigation';
import TokenOptions from './token-options';

export default function TokenAsset({ token }) {
  const dispatch = useDispatch();
  const chainId = useSelector(getCurrentChainId);
  const network = useSelector(deprecatedGetCurrentNetworkId);
  const selectedIdentity = useSelector(getSelectedIdentity);
  const selectedAccountName = selectedIdentity.name;
  const selectedAddress = selectedIdentity.address;
  const history = useHistory();

  return (
    <>
      <AssetNavigation
        accountName={selectedAccountName}
        assetName={token.symbol}
        onBack={() => history.push(DEFAULT_ROUTE)}
        optionsButton={
          <TokenOptions
            onRemove={() =>
              dispatch(showModal({ name: 'HIDE_TOKEN_CONFIRMATION', token }))
            }
            onViewEtherscan={() => {
              const url = getAccountLink(token.address, chainId, {}, network);
              global.platform.openTab({ url });
            }}
            tokenSymbol={token.symbol}
          />
        }
      />
      <TokenOverview className="asset__overview" token={token} />
      <TransactionList tokenAddress={token.address} />
    </>
  );
}

TokenAsset.propTypes = {
  token: PropTypes.shape({
    address: PropTypes.string.isRequired,
    decimals: PropTypes.number,
    symbol: PropTypes.string,
  }).isRequired,
};
