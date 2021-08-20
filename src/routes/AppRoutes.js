import React, { lazy, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Authenticated from '../../ui/app/helpers/higher-order-components/authenticated';
import Initialized from '../../ui/app/helpers/higher-order-components/initialized';
import errorsGlobalHandler from '../utils/errorsGlobalHandler';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../ui/app/helpers/constants/common';
import AppRootView from '../components/AppRootView';

import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_CREATE_ACCOUNT,
  ROUTE_HOME,
  ROUTE_APPROVE_POPUP,
  ROUTE_TOKEN_ADD,
  ROUTE_TOKEN_DETAIL,
  ROUTE_TRANSFER,
  ROUTE_TX_HISTORY,
  ROUTE_WALLET_SELECT,
  ROUTE_ACCOUNT_DETAIL,
  ROUTE_PRIVATE_KEY_EXPORT,
  ROUTE_DEMO_I18N,
} from './routeUrls';

const PageConnectHardware = lazy(() => import('../pages/PageConnectHardware'));
const PageWalletSelect = lazy(() => import('../pages/PageWalletSelect'));
const PageApprovePopup = lazy(() => import('../pages/PageApprovePopup'));
const PageCreateAccount = lazy(() => import('../pages/PageCreateAccount'));
const PageTransfer = lazy(() => import('../pages/PageTransfer'));
const PageTransactionHistory = lazy(() =>
  import('../pages/PageTransactionHistory'),
);
const PageTokenDetail = lazy(() => import('../pages/PageTokenDetail'));
const PageTokenAdd = lazy(() => import('../pages/PageTokenAdd'));
const PageHome = lazy(() => import('../pages/PageHome'));
const PageAccountDetail = lazy(() => import('../pages/PageAccountDetail'));
const PagePrivateKeyExport = lazy(() =>
  import('../pages/PagePrivateKeyExport'),
);
const PageDemoI18n = lazy(() => import('../pages/PageDemoI18n'));

errorsGlobalHandler.init();

// const authDisabled = IS_ENV_IN_TEST_OR_DEBUG;
const authDisabled = false; // use .metamaskrc.password auto unlock

function RouteAuthenticated({ page, component, exact, ...others }) {
  return (
    <Authenticated
      path={page}
      component={component}
      exact
      autoReturn
      authDisabled={authDisabled}
      {...others}
    />
  );
}

// eslint-disable-next-line import/no-anonymous-default-export
export default function AppRoutes() {
  return (
    <AppRootView>
      <Suspense fallback={<div />}>
        <Switch>
          <RouteAuthenticated
            path={ROUTE_CONNECT_HARDWARE}
            component={PageConnectHardware}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_WALLET_SELECT}
            component={PageWalletSelect}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_APPROVE_POPUP}
            component={PageApprovePopup}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_CREATE_ACCOUNT}
            component={PageCreateAccount}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_TRANSFER}
            component={PageTransfer}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_TX_HISTORY}
            component={PageTransactionHistory}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_TOKEN_DETAIL}
            component={PageTokenDetail}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_TOKEN_ADD}
            component={PageTokenAdd}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_ACCOUNT_DETAIL}
            component={PageAccountDetail}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_PRIVATE_KEY_EXPORT}
            component={PagePrivateKeyExport}
            exact
          />
          <RouteAuthenticated
            path={ROUTE_DEMO_I18N}
            component={PageDemoI18n}
            exact
          />
          {/* Home route should be at last one */}
          <RouteAuthenticated path={ROUTE_HOME} component={PageHome} exact />
        </Switch>
      </Suspense>
    </AppRootView>
  );
}
