import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from '@onekeyhq/ui-components';
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
import ExtAppTabBar from '../../../../../../src/components/ExtAppTabBar';
import ExtAppNavBar from '../../../../../../src/components/ExtAppNavBar';
import useI18n from '../../../../../../src/hooks/useI18n';
import storeHistory from '../../../../../../src/store/storeHistory';
import storeAccount from '../../../../../../src/store/storeAccount';

export const History = () => {
  const t = useI18n();
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
    <>
      <div className="home-history">
        <ExtAppNavBar
          title={t('activity')}
          subTitle={shortAddress}
          left={null}
          right={
            <Link
              icon
              color
              className="cursor-pointer"
              onClick={(event) => {
                // event.preventDefault();
                global.platform.openTab({
                  url: getAccountLink(address, chainId, rpcPrefs, network),
                });
              }}
            />
          }
        />
        <div className="home-history__content">
          <TransactionList />
        </div>
      </div>
    </>
  );
};
