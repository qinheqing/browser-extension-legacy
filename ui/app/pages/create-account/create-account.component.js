import React, { Component } from 'react';
import { Switch, Route, matchPath } from 'react-router-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  NEW_ACCOUNT_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  CONNECT_HARDWARE_ROUTE,
} from '../../helpers/constants/routes';
import { goToPageConnectHardware } from '../../helpers/utils/util';
import storeHistory from '../../../../src/store/storeHistory';
import { ROUTE_HOME } from '../../../../src/routes/routeUrls';
import NewAccountCreateForm from './new-account.container';
import NewAccountImportForm from './import-account';
import ConnectHardwareForm from './connect-hardware';

export default class CreateAccountPage extends Component {
  renderTabs() {
    const {
      hwOnlyMode,
      history,
      location: { pathname },
    } = this.props;
    const getClassNames = (path) =>
      classnames('new-account__tabs__tab', {
        'new-account__tabs__selected': matchPath(pathname, {
          path,
          exact: true,
        }),
      });

    return (
      <div className="new-account__tabs relative">
        {!hwOnlyMode && (
          <>
            <div
              className={getClassNames(NEW_ACCOUNT_ROUTE)}
              onClick={() => history.replace(NEW_ACCOUNT_ROUTE)}
            >
              {this.context.t('create')}
            </div>
            <div
              className={getClassNames(IMPORT_ACCOUNT_ROUTE)}
              onClick={() => history.replace(IMPORT_ACCOUNT_ROUTE)}
            >
              {this.context.t('import')}
            </div>
          </>
        )}

        <div
          className={getClassNames(CONNECT_HARDWARE_ROUTE)}
          onClick={() => goToPageConnectHardware({ replace: true })}
        >
          {this.context.t('hardware')}
        </div>

        <span
          onClick={() => storeHistory.goBack({ fallbackUrl: ROUTE_HOME })}
          className="cursor-pointer text-[40px] absolute right-[4px] top-[4px] leading-none px-2"
        >
          &times;
        </span>
      </div>
    );
  }

  render() {
    return (
      <div className="new-account page-layout-old">
        <div className="new-account__header">
          <div
            className={`new-account__header ${this.context.t('newAccount')}`}
          >
            {this.renderTabs()}
          </div>
        </div>
        <div className="new-account__form">
          <Switch>
            <Route
              exact
              path={NEW_ACCOUNT_ROUTE}
              component={NewAccountCreateForm}
            />
            <Route
              exact
              path={IMPORT_ACCOUNT_ROUTE}
              component={NewAccountImportForm}
            />
            <Route
              exact
              path={CONNECT_HARDWARE_ROUTE}
              component={ConnectHardwareForm}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

CreateAccountPage.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
  hwOnlyMode: PropTypes.bool,
};

CreateAccountPage.contextTypes = {
  t: PropTypes.func,
};
