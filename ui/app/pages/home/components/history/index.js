import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import TransactionList from '../../../../components/app/transaction-list';
import {
  getSelectedAccount,
  getCurrentKeyring,
  deprecatedGetCurrentNetworkId,
  getCurrentChainId,
  getRpcPrefsForCurrentProvider,
  getSelectedIdentity,
} from '../../../../selectors/selectors';
import getAccountLink from '../../../../../lib/account-link';

export const History = () => {
  const selectedAccount = useSelector(getSelectedAccount);
  const keyring = useSelector(getCurrentKeyring);
  const network = useSelector(deprecatedGetCurrentNetworkId);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  const selectedIdentity = useSelector(getSelectedIdentity);
  const { address } = selectedAccount;

  const shortAddress = `${selectedAccount.address.slice(
    0,
    6,
  )}...${selectedAccount.address.slice(-4)}`;

  return (
    <div className="home-history">
      <div className="home-history__header">
        <div className="home-history__info">
          <div className="home-history__title">Transaction</div>
          <div className="home-history__address">{shortAddress}</div>
        </div>
        <div
          onClick={() => {
            global.platform.openTab({
              url: getAccountLink(address, chainId, rpcPrefs, network),
            });
          }}
        >
          <img className="home-history__link" src="./images/icons/link.svg" />
        </div>
      </div>
      <div className="home-history__content">
        TODO incoming tx not working
        <TransactionList />
      </div>
    </div>
  );
};
