import React, { Component } from 'react';
import MenuBar from '../../../../components/app/menu-bar';
import AppHeader from '../../../../components/app/app-header';
import { EthOverview } from '../../../../components/app/wallet-overview';
import AssetList from '../../../../components/app/asset-list';
import { ASSET_ROUTE } from '../../../../helpers/constants/routes';

export default class Overview extends Component {
  render() {
    return (
      <div className="home__container">
        <AppHeader />
        <div className="home__main-view">
          <MenuBar />
          <div className="home__balance-wrapper">
            <EthOverview />
          </div>
          <div className="home__asset-wrapper">
            <div className="home__asset-title">Assets</div>
            <div className="home__asset-content">
              <AssetList
                onClickAsset={(asset) =>
                  history.push(`${ASSET_ROUTE}/${asset}`)
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
