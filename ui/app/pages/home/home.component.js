import React, { PureComponent, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Redirect,
  Route,
  matchPath,
  useHistory,
  Switch,
} from 'react-router-dom';
import { formatDate, goToPageConnectHardware } from '../../helpers/utils/util';
import HomeNotification from '../../components/app/home-notification';
import MultipleNotifications from '../../components/app/multiple-notifications';
import TransactionList from '../../components/app/transaction-list';
import MenuBar from '../../components/app/menu-bar';
import AppHeader from '../../components/app/app-header';
import Popover from '../../components/ui/popover';
import Button from '../../components/ui/button';
import ConnectedSites from '../connected-sites';
import ConnectedAccounts from '../connected-accounts';
import { EthOverview } from '../../components/app/wallet-overview';
import Settings from '../settings';

import {
  ASSET_ROUTE,
  RESTORE_VAULT_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  INITIALIZE_BACKUP_SEED_PHRASE_ROUTE,
  CONNECT_ROUTE,
  CONNECTED_ROUTE,
  CONNECTED_ACCOUNTS_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
  SETTINGS_ROUTE,
  TRANSACTIONS_ROUTE,
  OVERVIEW_ROUTE,
  DEFAULT_ROUTE,
} from '../../helpers/constants/routes';
import { WALLET_ACCOUNT_TYPES } from '../../helpers/constants/common';
import { ROUTE_HOME, ROUTE_TX_HISTORY } from '../../../../src/routes/routeUrls';
import utilsApp from '../../../../src/utils/utilsApp';
import useRedirectToCorrectHome, {
  redirectToCorrectHome,
} from '../../../../src/hooks/useRedirectToCorrectHome';
import { History as TxHistory } from './components/history';
import Overview from './components/overview';
import { Tabs, Tab } from './components/tabs';

export const MenuItem = ({
  defaultIcon,
  activeIcon,
  path,
  history,
  currentPath,
  exact,
}) => {
  const isActive = () => {
    if (path === OVERVIEW_ROUTE && currentPath === DEFAULT_ROUTE) {
      return true;
    }
    return matchPath(currentPath, { path, exact });
  };

  const onClick = useCallback(() => {
    history.push(path);
  }, [path, history]);
  return (
    <div className="home__route-item" onClick={onClick}>
      {isActive() ? activeIcon : defaultIcon}
    </div>
  );
};

export default class Home extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    hwOnlyMode: PropTypes.bool,
    accountType: PropTypes.string,
    forgottenPassword: PropTypes.bool,
    suggestedTokens: PropTypes.object,
    unconfirmedTransactionsCount: PropTypes.number,
    shouldShowSeedPhraseReminder: PropTypes.bool.isRequired,
    isPopup: PropTypes.bool,
    isNotification: PropTypes.bool.isRequired,
    showRestorePrompt: PropTypes.bool,
    selectedAddress: PropTypes.string,
    firstPermissionsRequestId: PropTypes.string,
    totalUnapprovedCount: PropTypes.number.isRequired,
    setConnectedStatusPopoverHasBeenShown: PropTypes.func,
    connectedStatusPopoverHasBeenShown: PropTypes.bool,
    defaultHomeActiveTabName: PropTypes.string,
    onTabClick: PropTypes.func.isRequired,
    isMainnet: PropTypes.bool,
    shouldShowWeb3ShimUsageNotification: PropTypes.bool.isRequired,
    setWeb3ShimUsageAlertDismissed: PropTypes.func.isRequired,
    originOfCurrentTab: PropTypes.string,
    disableWeb3ShimUsageAlert: PropTypes.func.isRequired,
    pendingApprovals: PropTypes.array,
  };

  state = {
    mounted: false,
    backupReminderVisible: true,
  };

  redirectToNewHomeIfNeed() {
    const { history } = this.props;
    return redirectToCorrectHome({
      fromNewHome: false,
      history,
      location: history.location,
    });
  }

  componentDidMount() {
    const {
      firstPermissionsRequestId,
      history,
      isNotification,
      suggestedTokens = {},
      totalUnapprovedCount,
      unconfirmedTransactionsCount,
      pendingApprovals,
    } = this.props;

    if (this.redirectToNewHomeIfNeed()) {
      return;
    }

    this.setState({ mounted: true });
    if (isNotification && totalUnapprovedCount === 0) {
      // close approve notification popup windows.
      global.platform.closeCurrentWindow();
    } else if (firstPermissionsRequestId) {
      // approve connection from Dapp
      history.push(`${CONNECT_ROUTE}/${firstPermissionsRequestId}`);
    } else if (unconfirmedTransactionsCount > 0) {
      // approve transaction from Dapp
      history.push(CONFIRM_TRANSACTION_ROUTE);
    } else if (Object.keys(suggestedTokens).length > 0) {
      // add token from https://www.onekey.so/tokens
      history.push(CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE);
    } else if (pendingApprovals.length > 0) {
      // add chain from https://chainlist.org/
      history.push(CONFIRMATION_V_NEXT_ROUTE);
    }
  }

  static getDerivedStateFromProps(
    {
      firstPermissionsRequestId,
      isNotification,
      suggestedTokens,
      totalUnapprovedCount,
      unconfirmedTransactionsCount,
    },
    { mounted },
  ) {
    if (!mounted) {
      if (isNotification && totalUnapprovedCount === 0) {
        return { closing: true };
      } else if (
        firstPermissionsRequestId ||
        unconfirmedTransactionsCount > 0 ||
        Object.keys(suggestedTokens).length > 0
      ) {
        return { redirecting: true };
      }
    }
    return null;
  }

  componentDidUpdate(_, prevState) {
    const { showRestorePrompt } = this.props;

    if (!prevState.closing && this.state.closing) {
      global.platform.closeCurrentWindow();
    }

    if (this.redirectToNewHomeIfNeed()) {
      // return
    }
  }

  renderNotifications() {
    const { t } = this.context;
    const {
      history,
      shouldShowSeedPhraseReminder,
      hwOnlyMode,
      isPopup,
      selectedAddress,
      showRestorePrompt,
      shouldShowWeb3ShimUsageNotification,
      setWeb3ShimUsageAlertDismissed,
      originOfCurrentTab,
      disableWeb3ShimUsageAlert,
    } = this.props;

    return (
      <MultipleNotifications>
        {!hwOnlyMode &&
        shouldShowSeedPhraseReminder &&
        this.state.backupReminderVisible ? (
          <HomeNotification
            descriptionText={t('backupApprovalNotice')}
            ignoreText={t('cancel')}
            onIgnore={() => this.setState({ backupReminderVisible: false })}
            acceptText={t('backupNow')}
            onAccept={() => {
              if (isPopup) {
                global.platform.openExtensionInBrowser(
                  INITIALIZE_BACKUP_SEED_PHRASE_ROUTE,
                );
              } else {
                history.push(INITIALIZE_BACKUP_SEED_PHRASE_ROUTE);
              }
            }}
            infoText={t('backupApprovalInfo')}
            key="home-backupApprovalNotice"
          />
        ) : (
          []
        )}
      </MultipleNotifications>
    );
  }

  render() {
    const {
      forgottenPassword,
      hwOnlyMode,
      accountType,
      history,
      currentPath,
      shouldShowSeedPhraseReminder,
    } = this.props;
    const { t } = this.context;

    if (forgottenPassword) {
      return <Redirect to={{ pathname: RESTORE_VAULT_ROUTE }} />;
    } else if (this.state.closing || this.state.redirecting) {
      return null;
    }

    return (
      <>
        <div className="main-container">
          <Route path={CONNECTED_ROUTE} component={ConnectedSites} exact />
          <Route
            path={CONNECTED_ACCOUNTS_ROUTE}
            component={ConnectedAccounts}
            exact
          />
          <div className="home__container-wrapper">
            <div className="home__route-container">
              <div className="home__route-view">
                <Switch>
                  <Route path={OVERVIEW_ROUTE} component={Overview} exact />
                  <Route
                    path={TRANSACTIONS_ROUTE}
                    component={TxHistory}
                    exact
                  />
                  <Route path={SETTINGS_ROUTE} component={Settings} />
                  <Route component={Overview} />
                </Switch>
              </div>
              <div className="home__route-list">
                <MenuItem
                  currentPath={currentPath}
                  history={history}
                  path={utilsApp.isOldHome() ? OVERVIEW_ROUTE : ROUTE_HOME}
                  exact
                  defaultIcon={<img src="./images/tabs/home.svg" />}
                  activeIcon={<img src="./images/tabs/home-active.svg" />}
                />
                <MenuItem
                  history={history}
                  exact
                  currentPath={currentPath}
                  path={
                    utilsApp.isOldHome() ? TRANSACTIONS_ROUTE : ROUTE_TX_HISTORY
                  }
                  defaultIcon={<img src="./images/tabs/transaction.svg" />}
                  activeIcon={
                    <img src="./images/tabs/transaction-active.svg" />
                  }
                />
                <MenuItem
                  currentPath={currentPath}
                  history={history}
                  path={SETTINGS_ROUTE}
                  defaultIcon={<img src="./images/tabs/preference.svg" />}
                  activeIcon={<img src="./images/tabs/preference-active.svg" />}
                />
              </div>
            </div>
            {this.renderNotifications()}
          </div>
        </div>
      </>
    );
  }
}
