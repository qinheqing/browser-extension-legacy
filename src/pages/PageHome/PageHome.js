import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { Button } from '@onekeyhq/ui-components';
import AppPageLayout from '../../components/AppPageLayout';
import storeAccount from '../../store/storeAccount';
import {
  ROUTE_ACCOUNT_DETAIL,
  ROUTE_TX_HISTORY,
  ROUTE_WALLET_SELECT,
} from '../../routes/routeUrls';
import storeWallet from '../../store/storeWallet';
import storeToken from '../../store/storeToken';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import utilsApp from '../../utils/utilsApp';
import TxSubmitSuccessView from '../../components/TxSubmitSuccessView';
import AppIcons from '../../components/AppIcons';
import OneButton from '../../components/OneButton';
import storeHistory from '../../store/storeHistory';
import storeChain from '../../store/storeChain';
import storeApp from '../../store/storeApp';
import useInitFirstAccount from '../../hooks/useInitFirstAccount';
import { ExtAppHeader } from '../../components/ExtAppHeader';
import useRedirectToCorrectHome from '../../hooks/useRedirectToCorrectHome';
import useI18n from '../../hooks/useI18n';
import ExtAccountOverview from '../../components/ExtAccountOverview';
import { ExtHomeAssetsList } from '../../components/ExtHomeAssetsList';
import ExtAppTabBar from '../../components/ExtAppTabBar';
import ErrorTestCase from '../../components/ErrorTestCase';

const PageHome = observer(function () {
  const history = useHistory();
  const [copied, handleCopy] = useCopyToClipboard();
  const { isUnlocked } = storeApp.legacyState;
  const { currentAccountAddress } = storeAccount;
  const { currentChainKey } = storeChain;
  const initAccountReady = useInitFirstAccount();
  const t = useI18n();

  useEffect(() => {
    if (initAccountReady && currentAccountAddress) {
      storeToken.fetchCurrentAccountTokens();
    }
  }, [initAccountReady, currentAccountAddress, currentChainKey]);

  useEffect(() => {
    (async () => {
      if (initAccountReady && isUnlocked && currentAccountAddress) {
        await storeAccount.autofixMismatchAddresses();
      }
    })();
  }, [initAccountReady, isUnlocked, currentAccountAddress]);

  const onAccountClick = useCallback(() => {
    storeHistory.push(ROUTE_ACCOUNT_DETAIL);
  }, []);

  if (useRedirectToCorrectHome({ fromNewHome: true })) {
    return null;
  }

  if (!initAccountReady) {
    return null;
  }

  const contentView = (() => {
    const { isHardwareOnlyMode } = storeApp;
    if (!currentAccountAddress) {
      const hardwareConnectBtn = storeChain.currentChainSupportHardware ? (
        <Button onClick={() => storeHistory.goToPageConnectHardware()}>
          {t('connectHardwareWallet')}
        </Button>
      ) : (
        <span>当前网络不支持硬件</span>
      );
      const createAccountBtn = (
        <Button onClick={() => storeHistory.goToPageCreateAccount()}>
          {t('createAccount')}
        </Button>
      );
      return (
        <div className="h-full u-flex-center flex-col px-4">
          <div className="my-4">
            {isHardwareOnlyMode ? hardwareConnectBtn : createAccountBtn}
          </div>
        </div>
      );
    }

    return (
      <>
        <ExtAccountOverview />
        {/*
        <AccountCard
          key={storeAccount.refreshKey}
          showMaskAssetBalanceEye
          maskAssetBalance={storeStorage.maskAssetBalance}
          account={storeAccount.currentAccountInfo}
          showBalance
          watchBalanceChange
          showActiveBadge={false}
          onClick={onAccountClick}
        />
        */}
        {/* <HomeTopActionsBar />*/}
        <ExtHomeAssetsList key={storeAccount.refreshKey} />
      </>
    );
  })();

  return contentView;
});

function PageHomeLayout() {
  const { currentChainKey } = storeChain;
  const { currentAccountAddress } = storeAccount;
  const { homeType } = storeApp;
  const key = `${currentChainKey} ${currentAccountAddress} ${homeType}`;
  return (
    <AppPageLayout
      header={<ExtAppHeader />}
      footer={<ExtAppTabBar name={ExtAppTabBar.names.Home} />}
    >
      <PageHome key={key} />
      {/* <ErrorTestCase />*/}
    </AppPageLayout>
  );
}

export default observer(PageHomeLayout);
