import React, { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Authenticated from '../../ui/app/helpers/higher-order-components/authenticated';
import Initialized from '../../ui/app/helpers/higher-order-components/initialized';

import PageConnectHardware from '../pages/PageConnectHardware';
import PageWalletSelect from '../pages/PageWalletSelect';
import PageHome from '../pages/PageHome';
import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_HOME,
  ROUTE_WALLET_SELECT,
} from './routeUrls';

// eslint-disable-next-line import/no-anonymous-default-export
export default function AppRoutes() {
  return (
    <Switch>
      <Authenticated
        path={ROUTE_CONNECT_HARDWARE}
        component={PageConnectHardware}
        exact
        autoReturn
        authDisabled
      />
      <Authenticated
        path={ROUTE_WALLET_SELECT}
        component={PageWalletSelect}
        exact
        autoReturn
        authDisabled
      />
      <Authenticated
        path={ROUTE_HOME}
        component={PageHome}
        exact
        autoReturn
        authDisabled
      />
    </Switch>
  );
}
