import React, { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Authenticated from '../../ui/app/helpers/higher-order-components/authenticated';
import Initialized from '../../ui/app/helpers/higher-order-components/initialized';
import PageConnectHardware from '../pages/PageConnectHardware';
import PageWalletSelect from '../pages/PageWalletSelect';
import PageHome from '../pages/PageHome';
import PagePopup from '../pages/PagePopup';
import PageCreateAccount from '../pages/PageCreateAccount';
import utilsErrorsGlobalHandler from '../utils/utilsErrorsGlobalHandler';
import PageTransfer from '../pages/PageTransfer';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../ui/app/helpers/constants/common';
import AppRootView from '../components/AppRootView';
import PageTokenDetail from '../pages/PageTokenDetail';
import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_CREATE_ACCOUNT,
  ROUTE_HOME,
  ROUTE_POPUP,
  ROUTE_TOKEN_DETAIL,
  ROUTE_TRANSFER,
  ROUTE_WALLET_SELECT,
} from './routeUrls';

utilsErrorsGlobalHandler.init();

const authDisabled = IS_ENV_IN_TEST_OR_DEBUG;

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
        <RouteAuthenticated path={ROUTE_POPUP} component={PagePopup} exact />
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
          path={ROUTE_TOKEN_DETAIL}
          component={PageTokenDetail}
          exact
        />
        {/* Home route should be at last one */}
        <RouteAuthenticated path={ROUTE_HOME} component={PageHome} exact />
      </Switch>
    </AppRootView>
  );
}
