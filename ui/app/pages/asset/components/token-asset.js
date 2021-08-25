import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { createTokenTrackerLinkForChain } from '@onekeyhq/etherscan-link';
import TransactionList from '../../../components/app/transaction-list';
import { TokenOverview } from '../../../components/app/wallet-overview';
import {
  getCurrentChainId,
  getCurrentNetworkId,
  getSelectedIdentity,
} from '../../../selectors';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { showModal } from '../../../store/actions';

import { getEtherscanNetwork } from '../../../../lib/etherscan-prefix-for-network';
import AssetNavigation from './asset-navigation';
import TokenOptions from './token-options';

export default function TokenAsset({ token }) {
  const dispatch = useDispatch();
  const chainId = useSelector(getCurrentChainId);
  const network = useSelector(getCurrentNetworkId);
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
              const url = createTokenTrackerLinkForChain(
                token.address,
                chainId,
                selectedAddress,
              );

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
