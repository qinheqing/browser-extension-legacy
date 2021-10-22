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
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../../ui/app/helpers/constants/common';
import storeHistory from '../../store/storeHistory';
import storeChain from '../../store/storeChain';
import { CONST_CHAIN_KEYS } from '../../consts/consts';
import utilsToast from '../../utils/utilsToast';
import storeApp from '../../store/storeApp';

const AccountsList = observer(function () {
  const history = useHistory();
  const accounts = storeAccount.accountsListOfAccountsGroup;
  const chainInfo = storeAccount.chainInfoOfAccountsGroup;
  if (!chainInfo) {
    return null;
  }
  const wallet = chainInfo
    ? walletFactory.createWallet({
        chainInfo,
      })
    : null;
  return (
    <div className="overflow-y-auto flex-1">
      <h3 className="text-center text-sm py-2 px-4 shadow-sm bg-white ">
        {chainInfo.name}
      </h3>
      {accounts.map((account) => {
        return (
          <AccountCard
            key={account.chainKey + account.address}
            wallet={wallet}
            onClick={() => {
              storeAccount.setCurrentAccount({ account });
              if (window.history.length <= 1) {
                storeHistory.replaceToHome();
              } else {
                storeHistory.goBack();
              }
            }}
            showBalance
            account={account}
          />
        );
      })}
      {!accounts.length && (
        <div className="py-10 px-4 text-gray-600 text-lg text-center">
          点击下方按钮添加账户
        </div>
      )}
    </div>
  );
});

function PageWalletSelect() {
  const history = useHistory();
  const btnDisabled = !storeAccount.accountsGroupFilter.chainKey;
  const connectHardwareButton = (
    <OneButton
      block
      type="primary"
      disabled={btnDisabled}
      onClick={() => {
        const chainInfo = storeChain.getChainInfoByKey(
          storeAccount.accountsGroupFilter.chainKey,
        );
        if (chainInfo?.baseChain === CONST_CHAIN_KEYS.SOL) {
          utilsApp.openStandalonePage(ROUTE_CONNECT_HARDWARE);
        } else {
          utilsToast.toast.info('该链暂不支持硬件钱包');
        }
      }}
    >
      连接硬件设备
    </OneButton>
  );
  return (
    <AppPageLayout
      title="切换账户"
      footer={
        <footer className="bg-white flex justify-between py-2 px-3">
          <div className="min-w-[36px]" />
          {!storeApp.isHardwareOnlyMode && (
            <>
              <OneButton
                block
                disabled={btnDisabled}
                onClick={() => history.push(ROUTE_CREATE_ACCOUNT)}
              >
                + 添加钱包账户
              </OneButton>
              <div className="w-6" />
            </>
          )}
          {connectHardwareButton}
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
