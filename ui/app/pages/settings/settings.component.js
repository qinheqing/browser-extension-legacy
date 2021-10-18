import React, { PureComponent, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, matchPath, useHistory } from 'react-router-dom';
import classnames from 'classnames';
import TabBar from '../../components/app/tab-bar';
import {
  ALERTS_ROUTE,
  ADVANCED_ROUTE,
  SECURITY_ROUTE,
  GENERAL_ROUTE,
  ABOUT_US_ROUTE,
  SETTINGS_ROUTE,
  NETWORKS_ROUTE,
  CONTACT_LIST_ROUTE,
  CONTACT_ADD_ROUTE,
  CONTACT_EDIT_ROUTE,
  CONTACT_VIEW_ROUTE,
  CONTACT_MY_ACCOUNTS_ROUTE,
  CONTACT_MY_ACCOUNTS_VIEW_ROUTE,
  CONTACT_MY_ACCOUNTS_EDIT_ROUTE,
} from '../../helpers/constants/routes';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_FULLSCREEN } from '../../../../shared/constants/app';
import SettingsTab from './settings-tab';
import AlertsTab from './alerts-tab';
import NetworksTab from './networks-tab';
import AdvancedTab from './advanced-tab';
import InfoTab from './info-tab';
import SecurityTab from './security-tab';
import ContactListTab from './contact-list-tab';

const MenuItem = ({ title, desc, icon, path }) => {
  const history = useHistory();
  const onClick = useCallback(() => {
    history.push(path);
  }, [path]);
  return (
    <div className="setting-pages-v2__menu-item" onClick={onClick}>
      <div className="setting-pages-v2__menu-item-icon">{icon}</div>
      <div className="setting-pages-v2__menu-item-content">
        <div className="setting-pages-v2__menu-item-mid">
          <div className="setting-pages-v2__menu-item-title">{title}</div>
          <div className="setting-pages-v2__menu-item-desc">{desc}</div>
        </div>
        <div className="setting-pages-v2__menu-item-arrow">
          <img
            className="setting-pages-v2__menu-item-img"
            src="./images/preference/setting-arrow.svg"
          />
        </div>
      </div>
    </div>
  );
};

class SettingsPage extends PureComponent {
  static propTypes = {
    addressName: PropTypes.string,
    backRoute: PropTypes.string,
    currentPath: PropTypes.string,
    history: PropTypes.object,
    isAddressEntryPage: PropTypes.bool,
    isPopup: PropTypes.bool,
    pathnameI18nKey: PropTypes.string,
    initialBreadCrumbRoute: PropTypes.string,
    breadCrumbTextKey: PropTypes.string,
    initialBreadCrumbKey: PropTypes.string,
    mostRecentOverviewPage: PropTypes.string.isRequired,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const { history, backRoute, currentPath, mostRecentOverviewPage } =
      this.props;

    return (
      <div
        className={classnames('main-container settings-page', {
          'settings-page--selected': currentPath !== SETTINGS_ROUTE,
        })}
      >
        <div className="settings-page__header">
          {currentPath !== SETTINGS_ROUTE && (
            <div
              className="settings-page__back-button"
              onClick={() => history.push(backRoute)}
            />
          )}
          {this.renderTitle()}
        </div>
        <div className="settings-page__content">
          <div className="settings-page__content__tabs">
            {this.renderTabs()}
          </div>
          <div className="settings-page__content__modules">
            {this.renderSubHeader()}
            {this.renderContent()}
          </div>
        </div>
      </div>
    );
  }

  renderTitle() {
    const { t } = this.context;
    const { isPopup, pathnameI18nKey, addressName } = this.props;

    let titleText;

    if (isPopup && addressName) {
      titleText = addressName;
    } else if (pathnameI18nKey && isPopup) {
      titleText = t(pathnameI18nKey);
    } else {
      titleText = t('settings');
    }

    return <div className="settings-page__header__title">{titleText}</div>;
  }

  renderSubHeader() {
    const { t } = this.context;
    const {
      currentPath,
      isPopup,
      isAddressEntryPage,
      pathnameI18nKey,
      addressName,
      initialBreadCrumbRoute,
      breadCrumbTextKey,
      history,
      initialBreadCrumbKey,
    } = this.props;

    let subheaderText;

    if (isPopup && isAddressEntryPage) {
      subheaderText = t('settings');
    } else if (initialBreadCrumbKey) {
      subheaderText = t(initialBreadCrumbKey);
    } else {
      subheaderText = t(pathnameI18nKey || 'general');
    }

    return (
      !currentPath.startsWith(NETWORKS_ROUTE) && (
        <div className="settings-page__subheader">
          <div
            className={classnames({
              'settings-page__subheader--link': initialBreadCrumbRoute,
            })}
            onClick={() =>
              initialBreadCrumbRoute && history.push(initialBreadCrumbRoute)
            }
          >
            {subheaderText}
          </div>
          {breadCrumbTextKey && (
            <div className="settings-page__subheader--break">
              <span>{' > '}</span>
              {t(breadCrumbTextKey)}
            </div>
          )}
          {isAddressEntryPage && (
            <div className="settings-page__subheader--break">
              <span>{' > '}</span>
              {addressName}
            </div>
          )}
        </div>
      )
    );
  }

  renderTabsV2() {
    const { t } = this.context;
    return (
      <div className="settings-pages-v2">
        <div className="setting-pages-v2__menus">
          <MenuItem
            path={GENERAL_ROUTE}
            title={t('general')}
            desc={t('generalSettingsDescription')}
            icon={<img src="./images/preference/setting-general.svg" />}
          />
          <MenuItem
            path={ADVANCED_ROUTE}
            title={t('advanced')}
            desc={t('advancedSettingsDescription')}
            icon={<img src="./images/preference/setting-advanced.svg" />}
          />
          <MenuItem
            path={CONTACT_LIST_ROUTE}
            title={t('contacts')}
            desc={t('contactsSettingsDescription')}
            icon={<img src="./images/preference/setting-networks.svg" />}
          />
          <MenuItem
            path={SECURITY_ROUTE}
            title={t('securityAndPrivacy')}
            desc={t('securitySettingsDescription')}
            icon={<img src="./images/preference/setting-security.svg" />}
          />
          <MenuItem
            path={ALERTS_ROUTE}
            title={t('alerts')}
            desc={t('alertsSettingsDescription')}
            icon={<img src="./images/preference/setting-notification.svg" />}
          />
          <MenuItem
            path={NETWORKS_ROUTE}
            title={t('networks')}
            desc={t('networkSettingsDescription')}
            icon={<img src="./images/preference/setting-networks.svg" />}
          />
          <MenuItem
            path={ABOUT_US_ROUTE}
            title={t('about')}
            desc={t('aboutSettingsDescription')}
            icon={<img src="./images/preference/setting-accounts.svg" />}
          />
        </div>
      </div>
    );
  }

  renderTabs() {
    const { history, currentPath } = this.props;
    const { t } = this.context;

    if (getEnvironmentType() !== ENVIRONMENT_TYPE_FULLSCREEN) {
      return this.renderTabsV2();
    }

    return (
      <TabBar
        tabs={[
          {
            content: t('general'),
            description: t('generalSettingsDescription'),
            key: GENERAL_ROUTE,
          },
          {
            content: t('advanced'),
            description: t('advancedSettingsDescription'),
            key: ADVANCED_ROUTE,
          },
          {
            content: t('contacts'),
            description: t('contactsSettingsDescription'),
            key: CONTACT_LIST_ROUTE,
          },
          {
            content: t('securityAndPrivacy'),
            description: t('securitySettingsDescription'),
            key: SECURITY_ROUTE,
          },
          {
            content: t('alerts'),
            description: t('alertsSettingsDescription'),
            key: ALERTS_ROUTE,
          },
          {
            content: t('networks'),
            description: t('networkSettingsDescription'),
            key: NETWORKS_ROUTE,
          },
          {
            content: t('about'),
            description: t('aboutSettingsDescription'),
            key: ABOUT_US_ROUTE,
          },
        ]}
        isActive={(key) => {
          if (key === GENERAL_ROUTE && currentPath === SETTINGS_ROUTE) {
            return true;
          }
          return matchPath(currentPath, { path: key, exact: true });
        }}
        onSelect={(key) => history.push(key)}
      />
    );
  }

  renderContent() {
    return (
      <Switch>
        <Route exact path={GENERAL_ROUTE} component={SettingsTab} />
        <Route exact path={ABOUT_US_ROUTE} component={InfoTab} />
        <Route exact path={ADVANCED_ROUTE} component={AdvancedTab} />
        <Route exact path={ALERTS_ROUTE} component={AlertsTab} />
        <Route path={NETWORKS_ROUTE} component={NetworksTab} />
        <Route exact path={SECURITY_ROUTE} component={SecurityTab} />
        <Route exact path={CONTACT_LIST_ROUTE} component={ContactListTab} />
        <Route exact path={CONTACT_ADD_ROUTE} component={ContactListTab} />
        <Route
          exact
          path={CONTACT_MY_ACCOUNTS_ROUTE}
          component={ContactListTab}
        />
        <Route
          exact
          path={`${CONTACT_EDIT_ROUTE}/:id`}
          component={ContactListTab}
        />
        <Route
          exact
          path={`${CONTACT_VIEW_ROUTE}/:id`}
          component={ContactListTab}
        />
        <Route
          exact
          path={`${CONTACT_MY_ACCOUNTS_VIEW_ROUTE}/:id`}
          component={ContactListTab}
        />
        <Route
          exact
          path={`${CONTACT_MY_ACCOUNTS_EDIT_ROUTE}/:id`}
          component={ContactListTab}
        />
        <Route component={SettingsTab} />
      </Switch>
    );
  }
}

export default SettingsPage;
