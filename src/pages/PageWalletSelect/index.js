import React from 'react';
import { Observer, observer } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';
import { sampleSize, range } from 'lodash';
import storeAccount from '../../store/storeAccount';
import AppFrame from '../../components/AppFrame';
import AccountsGroupBar from '../../components/AccountsGroupBar';
import AccountCard from '../../components/AccountCard';
import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_CREATE_ACCOUNT,
  ROUTE_HOME,
} from '../../routes/routeUrls';
import walletFactory from '../../wallets/walletFactory';
import utilsApp from '../../utils/utilsApp';

function AccountsList() {
  const history = useHistory();
  return (
    <Observer>
      {() => {
        const accounts = storeAccount.accountsListOfAccountsGroup;
        const chainInfo = storeAccount.chainInfoOfAccountsGroup;
        const wallet = chainInfo
          ? walletFactory.createWallet({
              chainInfo,
            })
          : null;
        return (
          <div>
            {accounts.map((account) => {
              return (
                <AccountCard
                  key={account.chainKey + account.address}
                  wallet={wallet}
                  onClick={() => {
                    storeAccount.setCurrentAccount({ account });
                    history.replace(ROUTE_HOME);
                  }}
                  showBalance
                  account={account}
                />
              );
            })}
            {!accounts.length && (
              <div className="PageWalletSelect__noAccounts">
                Click buttons below to add accounts or connect hardware
              </div>
            )}
          </div>
        );
      }}
    </Observer>
  );
}

function PageWalletSelect() {
  const history = useHistory();
  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <div className="PageWalletSelect">
              <div className="PageWalletSelect__header">
                <button onClick={() => history.goBack()}> &lt; Back </button>
                <AccountsGroupBar />
              </div>
              <AccountsList />
              <footer className="PageWalletSelect__footerActions">
                <button
                  disabled={!storeAccount.accountsGroupFilter.chainKey}
                  onClick={() => history.push(ROUTE_CREATE_ACCOUNT)}
                >
                  + Add accounts
                </button>{' '}
                <button
                  disabled={!storeAccount.accountsGroupFilter.chainKey}
                  onClick={() =>
                    utilsApp.openStandalonePage(ROUTE_CONNECT_HARDWARE)
                  }
                >
                  Connect hardware
                </button>
              </footer>
            </div>
          </AppFrame>
        );
      }}
    </Observer>
  );
}

export default PageWalletSelect;
