import React, { Component } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@onekeyhq/ui-components';
import MenuBar from '../../../../components/app/menu-bar';
import AppHeader from '../../../../components/app/app-header';
import { EthOverview } from '../../../../components/app/wallet-overview';
import { ASSET_ROUTE } from '../../../../helpers/constants/routes';
import { ExtAppHeader } from '../../../../../../src/components/ExtAppHeader';
import { WALLET_ACCOUNT_TYPES } from '../../../../helpers/constants/common';
import { goToPageConnectHardware } from '../../../../helpers/utils/util';
import {
  getAccountType,
  getCurrentChainId,
  getSelectedAddress,
} from '../../../../selectors';
import useI18n from '../../../../../../src/hooks/useI18n';
import useCurrentAccountAvailable from '../../../../../../src/hooks/useCurrentAccountAvailable';
import { ExtHomeAssetsList } from '../../../../../../src/components/ExtHomeAssetsList';
import ExtAppTabBar from '../../../../../../src/components/ExtAppTabBar';
import { ExtAccountOverviewInfoBar } from '../../../../../../src/components/ExtAccountOverview';

const Overview = () => {
  const history = useHistory();
  const t = useI18n();
  const accountType = useSelector(getAccountType);
  const accountAddress = useSelector(getSelectedAddress);
  const hwOnlyMode = useSelector((state) => state?.metamask?.hwOnlyMode);
  const available = useCurrentAccountAvailable();
  const chainId = useSelector(getCurrentChainId);

  let contentView = (
    <>
      <div className="home__balance-wrapper">
        <ExtAccountOverviewInfoBar
          address={accountAddress}
          type={accountType}
        />
        <EthOverview />
      </div>
      {/* <ExtHomeAssetsList key={chainId} />*/}
      <ExtHomeAssetsList />
    </>
  );
  if (hwOnlyMode && !available) {
    contentView = (
      <div className="home__container home__connect-hw">
        <Button
          onClick={() => {
            goToPageConnectHardware();
          }}
        >
          {t('connectHardwareWallet')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="home__container">
        {/* <AppHeader />*/}
        <ExtAppHeader />
        <div className="home__main-view">
          {/* <MenuBar /> */}
          {contentView}
        </div>
      </div>
    </>
  );
};

export default Overview;
