import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import { matchPath, Route, Switch } from 'react-router-dom';
import IdleTimer from 'react-idle-timer';

import { isNumber } from 'lodash';
import FirstTimeFlow from '../first-time-flow';
import SendTransactionScreen from '../send';
import ConfirmTransaction from '../confirm-transaction';
import Sidebar from '../../components/app/sidebars';
import Home from '../home';
import Settings from '../settings';
import Authenticated from '../../helpers/higher-order-components/authenticated';
import Initialized from '../../helpers/higher-order-components/initialized';
import Lock from '../lock';
import PermissionsConnect from '../permissions-connect';
import RestoreVaultPage from '../keychains/restore-vault';
import ChangePasswordPage from '../keychains/change-password';
import RevealSeedConfirmation from '../keychains/reveal-seed';
import AddTokenPage from '../add-token';
import ConfirmAddTokenPage from '../confirm-add-token';
import ConfirmAddSuggestedTokenPage from '../confirm-add-suggested-token';
import CreateAccountPage from '../create-account';
import Loading from '../../components/ui/loading-screen';
import LoadingNetwork from '../../components/app/loading-network-screen';
import NetworkDropdown from '../../components/app/dropdowns-popover/network-dropdown';
import AccountMenu from '../../components/app/account-menu';
import { Modal } from '../../components/app/modals';
import Alert from '../../components/ui/alert';
import AppHeader from '../../components/app/app-header';
import UnlockPage from '../unlock-page';
import Alerts from '../../components/app/alerts';
import Asset from '../asset';
import Receive from '../receive';

import {
  ADD_TOKEN_ROUTE,
  ASSET_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  CONFIRM_ADD_TOKEN_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  CONNECT_ROUTE,
  DEFAULT_ROUTE,
  INITIALIZE_ROUTE,
  INITIALIZE_UNLOCK_ROUTE,
  LOCK_ROUTE,
  NEW_ACCOUNT_ROUTE,
  RESTORE_VAULT_ROUTE,
  REVEAL_SEED_ROUTE,
  SEND_ROUTE,
  SETTINGS_ROUTE,
  UNLOCK_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
  CHANGE_PASSWORD_ROUTE,
  CONNECTED_ROUTE,
  RECEIVE_ROUTE,
} from '../../helpers/constants/routes';
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../../../shared/constants/app';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { TRANSACTION_STATUSES } from '../../../../shared/constants/transaction';
import ConfirmationPage from '../confirmation';
import AppRoutes from '../../../../src/routes/AppRoutes';
import { ROUTE_PREFIX } from '../../../../src/routes/routeUrls';
import {
  OldHomeRootComponents,
  UniversalRoutesWrapper,
} from '../../../../src/components/AppRootView';
import utilsApp from '../../../../src/utils/utilsApp';
import utilsWalletRemove from '../../../../src/utils/utilsWalletRemove';
import WalletRemoveAutomation from '../../../../src/components/WalletRemoveAutomation';

const AllRoutesComponentsProps = {
  autoLockTimeLimit: PropTypes.number,
  setLastActiveTime: PropTypes.func,
};

class AllRoutesComponents extends Component {
  render() {
    const { autoLockTimeLimit, setLastActiveTime } = this.props;
    const routes = (
      <Switch>
        <Route path={ROUTE_PREFIX}>
          <AppRoutes />
        </Route>
        <Route path={DEFAULT_ROUTE}>
          <OldHomeRootComponents />
          <Switch>
            <Route path={LOCK_ROUTE} component={Lock} exact />
            <Route path={INITIALIZE_ROUTE} component={FirstTimeFlow} />
            <Initialized path={UNLOCK_ROUTE} component={UnlockPage} exact />
            <Initialized
              path={RESTORE_VAULT_ROUTE}
              component={RestoreVaultPage}
              exact
            />
            <Initialized
              path={CHANGE_PASSWORD_ROUTE}
              component={ChangePasswordPage}
              exact
            />
            <Authenticated
              path={REVEAL_SEED_ROUTE}
              component={RevealSeedConfirmation}
              exact
            />
            {/* <Authenticated path={SETTINGS_ROUTE} component={Settings} /> */}
            <Authenticated
              path={`${CONFIRM_TRANSACTION_ROUTE}/:id?`}
              component={ConfirmTransaction}
            />
            <Authenticated
              path={SEND_ROUTE}
              component={SendTransactionScreen}
              exact
            />
            <Authenticated
              path={ADD_TOKEN_ROUTE}
              component={AddTokenPage}
              exact
            />
            <Authenticated path={RECEIVE_ROUTE} component={Receive} exact />
            <Authenticated
              path={CONFIRM_ADD_TOKEN_ROUTE}
              component={ConfirmAddTokenPage}
              exact
            />
            <Authenticated
              path={CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE}
              component={ConfirmAddSuggestedTokenPage}
              exact
            />
            <Authenticated
              path={CONFIRMATION_V_NEXT_ROUTE}
              component={ConfirmationPage}
            />
            <Authenticated
              path={NEW_ACCOUNT_ROUTE}
              component={CreateAccountPage}
            />
            <Authenticated
              path={`${CONNECT_ROUTE}/:id`}
              component={PermissionsConnect}
            />
            <Authenticated path={`${ASSET_ROUTE}/:asset`} component={Asset} />
            <Authenticated path={DEFAULT_ROUTE} component={Home} />
          </Switch>
        </Route>
      </Switch>
    );

    if (autoLockTimeLimit > 0) {
      return (
        <IdleTimer onAction={setLastActiveTime} throttle={1000}>
          {routes}
        </IdleTimer>
      );
    }

    return routes;
  }
}
AllRoutesComponents.propTypes = AllRoutesComponentsProps;

class AllRoutesComponentsPure extends PureComponent {
  render() {
    return <AllRoutesComponents {...this.props} />;
  }
}
AllRoutesComponentsPure.propTypes = AllRoutesComponentsProps;

export default class Routes extends Component {
  static propTypes = {
    currentCurrency: PropTypes.string,
    setCurrentCurrencyToUSD: PropTypes.func,
    isLoading: PropTypes.bool,
    loadingMessage: PropTypes.string,
    alertMessage: PropTypes.string,
    textDirection: PropTypes.string,
    isNetworkLoading: PropTypes.bool,
    provider: PropTypes.object,
    frequentRpcListDetail: PropTypes.array,
    sidebar: PropTypes.object,
    alertOpen: PropTypes.bool,
    hideSidebar: PropTypes.func,
    isUnlocked: PropTypes.bool,
    setLastActiveTime: PropTypes.func,
    history: PropTypes.object,
    location: PropTypes.object,
    lockMetaMask: PropTypes.func,
    submittedPendingTransactions: PropTypes.array,
    isMouseUser: PropTypes.bool,
    setMouseUserState: PropTypes.func,
    providerId: PropTypes.string,
    autoLockTimeLimit: PropTypes.number,
    pageChanged: PropTypes.func.isRequired,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    global.onekeyHistory = props.history;
  }

  UNSAFE_componentWillMount() {
    const { currentCurrency, pageChanged, setCurrentCurrencyToUSD } =
      this.props;

    if (!currentCurrency) {
      setCurrentCurrencyToUSD();
    }

    this.props.history.listen((locationObj, action) => {
      if (action === 'PUSH') {
        pageChanged(locationObj.pathname);
      }
    });
  }

  render() {
    const {
      isLoading,
      isUnlocked,
      alertMessage,
      textDirection,
      loadingMessage,
      isNetworkLoading,
      provider,
      frequentRpcListDetail,
      setMouseUserState,
      sidebar,
      submittedPendingTransactions,
      isMouseUser,
    } = this.props;
    const loadMessage =
      loadingMessage || isNetworkLoading
        ? this.getConnectingLabel(loadingMessage)
        : null;

    const {
      isOpen: sidebarIsOpen,
      transitionName: sidebarTransitionName,
      type: sidebarType,
      props,
    } = sidebar;
    const { transaction: sidebarTransaction } = props || {};

    const sidebarShouldClose =
      sidebarTransaction &&
      !sidebarTransaction.status === TRANSACTION_STATUSES.FAILED &&
      !submittedPendingTransactions.find(
        ({ id }) => id === sidebarTransaction.id,
      );

    return (
      <div
        className={classnames('app', { 'mouse-user-styles': isMouseUser })}
        dir={textDirection}
        // body click re-render
        onClick={() => setMouseUserState(true)}
        onKeyDown={(e) => {
          if (e.keyCode === 9) {
            setMouseUserState(false);
          }
        }}
      >
        <Modal />
        <Alert visible={this.props.alertOpen} msg={alertMessage} />
        <Sidebar
          sidebarOpen={sidebarIsOpen}
          sidebarShouldClose={sidebarShouldClose}
          hideSidebar={this.props.hideSidebar}
          transitionName={sidebarTransitionName}
          type={sidebarType}
          sidebarProps={sidebar.props}
        />
        <NetworkDropdown
          provider={provider}
          frequentRpcListDetail={frequentRpcListDetail}
        />
        <AccountMenu />
        <div
          className={classnames('main-container-wrapper all-routes-wrapper')}
        >
          {isLoading && <Loading loadingMessage={loadMessage} />}
          {!isLoading && isNetworkLoading && <LoadingNetwork />}
          <UniversalRoutesWrapper>
            {utilsApp.isNewHome() ? (
              <AllRoutesComponentsPure />
            ) : (
              // There are many uncontrolled component in legacy code, so keep use Component,
              //    PureComponent will cause bugs.
              <AllRoutesComponents />
            )}
          </UniversalRoutesWrapper>
        </div>
        {isUnlocked ? <Alerts history={this.props.history} /> : null}
        <WalletRemoveAutomation />
      </div>
    );
  }

  getConnectingLabel(loadingMessage) {
    if (loadingMessage) {
      return loadingMessage;
    }
    const { provider, providerId } = this.props;

    switch (provider.type) {
      case 'mainnet':
        return this.context.t('connectingToMainnet');
      case 'ropsten':
        return this.context.t('connectingToRopsten');
      case 'kovan':
        return this.context.t('connectingToKovan');
      case 'rinkeby':
        return this.context.t('connectingToRinkeby');
      case 'goerli':
        return this.context.t('connectingToGoerli');
      default:
        return this.context.t('connectingTo', [providerId]);
    }
  }
}
