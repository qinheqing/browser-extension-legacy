import React from 'react';
import { Observer, observer } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';
import { sampleSize, range } from 'lodash';
import storeAccount from '../../store/storeAccount';
import AppPageLayout from '../../components/AppPageLayout';
import AccountsGroupBar from '../../components/AccountsGroupBar';
import AccountCard from '../../components/AccountCard';
import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_CREATE_ACCOUNT,
  ROUTE_HOME,
} from '../../routes/routeUrls';
import walletFactory from '../../wallets/walletFactory';
import utilsApp from '../../utils/utilsApp';
import OneButton from '../../components/OneButton';

const AccountsList = observer(function () {
  const history = useHistory();
  const accounts = storeAccount.accountsListOfAccountsGroup;
  const chainInfo = storeAccount.chainInfoOfAccountsGroup;
  const wallet = chainInfo
    ? walletFactory.createWallet({
        chainInfo,
      })
    : null;
  return (
    <div className="overflow-y-auto flex-1">
      {accounts.map((account) => {
        return (
          <AccountCard
            key={account.chainKey + account.address}
            wallet={wallet}
            onClick={() => {
              storeAccount.setCurrentAccount({ account });
              // TODO check history length, if zero, then replace()
              history.goBack();
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
});

function PageWalletSelect() {
  const history = useHistory();
  return (
    <AppPageLayout
      title="切换账户"
      footer={
        <footer className="bg-white flex justify-between py-2 px-3">
          <OneButton
            block
            disabled={!storeAccount.accountsGroupFilter.chainKey}
            onClick={() => history.push(ROUTE_CREATE_ACCOUNT)}
          >
            + Add accounts
          </OneButton>
          <div className="w-6" />
          <OneButton
            block
            type="primary"
            disabled={!storeAccount.accountsGroupFilter.chainKey}
            onClick={() => utilsApp.openStandalonePage(ROUTE_CONNECT_HARDWARE)}
          >
            Connect hardware
          </OneButton>
        </footer>
      }
    >
      <div className="flex items-stretch h-full">
        <AccountsGroupBar />
        <AccountsList />
      </div>
    </AppPageLayout>
  );
}

export default observer(PageWalletSelect);
