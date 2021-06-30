import React, { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Authenticated from '../../ui/app/helpers/higher-order-components/authenticated';
import Initialized from '../../ui/app/helpers/higher-order-components/initialized';

import PageConnectHardware from '../pages/PageConnectHardware';
import PageWalletSelect from '../pages/PageWalletSelect';
import PageHome from '../pages/PageHome';
import PagePopup from '../pages/PagePopup';
import PageCreateAccount from '../pages/PageCreateAccount';
import utilsErrorsGlobalHandler from '../utils/utilsErrorsGlobalHandler';
import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_CREATE_ACCOUNT,
  ROUTE_HOME,
  ROUTE_POPUP,
  ROUTE_WALLET_SELECT,
} from './routeUrls';

utilsErrorsGlobalHandler.init();

// eslint-disable-next-line import/no-anonymous-default-export
export default function AppRoutes() {
  return (
    <>
      <ToastContainer />
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
        <Authenticated
          path={ROUTE_POPUP}
          component={PagePopup}
          exact
          autoReturn
          authDisabled
        />
        <Authenticated
          path={ROUTE_CREATE_ACCOUNT}
          component={PageCreateAccount}
          exact
          autoReturn
          authDisabled
        />
      </Switch>
    </>
  );
}
