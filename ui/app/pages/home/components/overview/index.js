import React, { Component } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MenuBar from '../../../../components/app/menu-bar';
import AppHeader from '../../../../components/app/app-header';
import { EthOverview } from '../../../../components/app/wallet-overview';
import AssetList from '../../../../components/app/asset-list';
import { ASSET_ROUTE } from '../../../../helpers/constants/routes';
import { ExtAppHeader } from '../../../../../../src/components/ExtAppHeader';
import { WALLET_ACCOUNT_TYPES } from '../../../../helpers/constants/common';
import Button from '../../../../components/ui/button';
import { goToPageConnectHardware } from '../../../../helpers/utils/util';
import { getAccountType } from '../../../../selectors';
import useI18n from '../../../../../../src/hooks/useI18n';
import useCurrentAccountAvailable from '../../../../../../src/hooks/useCurrentAccountAvailable';

const Overview = () => {
  const history = useHistory();
  const t = useI18n();
  const accountType = useSelector(getAccountType);
  const hwOnlyMode = useSelector((state) => state?.metamask?.hwOnlyMode);
  const available = useCurrentAccountAvailable();
  let contentView = (
    <>
      <div className="home__balance-wrapper">
        <EthOverview />
      </div>
      <div className="home__asset-wrapper">
        <div className="home__asset-title">Assets</div>
        <div className="home__asset-content">
          <AssetList
            onClickAsset={(asset) => history.push(`${ASSET_ROUTE}/${asset}`)}
          />
        </div>
      </div>
    </>
  );
  if (hwOnlyMode && !available) {
    contentView = (
      <div className="home__container home__connect-hw">
        <Button
          type="secondary"
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
    <div className="home__container">
      {/* <AppHeader />*/}
      <ExtAppHeader />
      <div className="home__main-view">
        {/* <MenuBar /> */}
        {contentView}
      </div>
    </div>
  );
};

export default Overview;
