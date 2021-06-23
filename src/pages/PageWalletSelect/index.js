import React from 'react';
import { Observer, observer } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';
import storeAccount from '../../store/storeAccount';
import AppFrame from '../../components/AppFrame';
import AccountsGroupBar from '../../components/AccountsGroupBar';
import AccountCard from '../../components/AccountCard';
import { ROUTE_CONNECT_HARDWARE, ROUTE_HOME } from '../../routes/routeUrls';

function AccountsList() {
  const history = useHistory();
  return (
    <Observer>
      {() => {
        const accounts = storeAccount.currentAccountsList;

        return (
          <div>
            {accounts.map((acc) => {
              return (
                <AccountCard
                  key={acc.chainKey + acc.address}
                  onClick={() => {
                    storeAccount.setCurrentAccount({ account: acc });
                    history.replace(ROUTE_HOME);
                  }}
                  account={acc}
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
                <AccountsGroupBar />
              </div>
              <AccountsList />
              <footer className="PageWalletSelect__footerActions">
                <button>Add accounts</button>{' '}
                <button onClick={() => history.push(ROUTE_CONNECT_HARDWARE)}>
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
