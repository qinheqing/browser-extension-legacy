import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import Fuse from 'fuse.js';
import InputAdornment from '@material-ui/core/InputAdornment';
import classnames from 'classnames';
import { ENVIRONMENT_TYPE_POPUP } from '../../../../../shared/constants/app';
import { getEnvironmentType } from '../../../../../app/scripts/lib/util';
import Identicon from '../../ui/identicon';
import SiteIcon from '../../ui/site-icon';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import {
  WALLET_ACCOUNT_TYPES,
  IS_ENV_IN_TEST_OR_DEBUG,
  PRIMARY,
} from '../../../helpers/constants/common';
import {
  SETTINGS_ROUTE,
  ABOUT_US_ROUTE,
  NEW_ACCOUNT_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  CONNECT_HARDWARE_ROUTE,
  DEFAULT_ROUTE,
  RESTORE_VAULT_ROUTE,
} from '../../../helpers/constants/routes';
import TextField from '../../ui/text-field';
import SearchIcon from '../../ui/search-icon';
import {
  keyringTypeToAccountType,
  getAccountKeyring,
  clearBackgroundLocalStore,
  goToPageConnectHardware,
} from '../../../helpers/utils/util';
import { ROUTE_HOME } from '../../../../../src/routes/routeUrls';

export function AccountMenuItem(props) {
  const { icon, children, text, subText, className, onClick } = props;

  const itemClassName = classnames('account-menu__item', className, {
    'account-menu__item--clickable': Boolean(onClick),
  });
  return children ? (
    <div className={itemClassName} onClick={onClick}>
      {children}
    </div>
  ) : (
    <div className={itemClassName} onClick={onClick}>
      {icon ? <div className="account-menu__item__icon">{icon}</div> : null}
      {text ? <div className="account-menu__item__text">{text}</div> : null}
      {subText ? (
        <div className="account-menu__item__subtext">{subText}</div>
      ) : null}
    </div>
  );
}

AccountMenuItem.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
  text: PropTypes.node,
  subText: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default class AccountMenu extends Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    hwOnlyMode: PropTypes.bool,
    shouldShowAccountsSearch: PropTypes.bool,
    accounts: PropTypes.array,
    history: PropTypes.object,
    isAccountMenuOpen: PropTypes.bool,
    keyrings: PropTypes.array,
    lockMetamask: PropTypes.func,
    selectedAddress: PropTypes.string,
    showAccountDetail: PropTypes.func,
    toggleAccountMenu: PropTypes.func,
    addressConnectedDomainMap: PropTypes.object,
    originOfCurrentTab: PropTypes.string,
  };

  accountsRef;

  state = {
    shouldShowScrollButton: false,
    searchQuery: '',
  };

  addressFuse = new Fuse([], {
    shouldSort: false,
    threshold: 0.45,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'address', weight: 0.5 },
    ],
  });

  componentDidUpdate(prevProps, prevState) {
    const { isAccountMenuOpen: prevIsAccountMenuOpen } = prevProps;
    const { searchQuery: prevSearchQuery } = prevState;
    const { isAccountMenuOpen } = this.props;
    const { searchQuery } = this.state;

    if (!prevIsAccountMenuOpen && isAccountMenuOpen) {
      this.setShouldShowScrollButton();
      this.resetSearchQuery();
    }

    // recalculate on each search query change
    // whether we can show scroll down button
    if (isAccountMenuOpen && prevSearchQuery !== searchQuery) {
      this.setShouldShowScrollButton();
    }
  }

  renderAccountsSearch() {
    const inputAdornment = (
      <InputAdornment
        position="start"
        style={{
          maxHeight: 'none',
          marginRight: 0,
          marginLeft: '8px',
        }}
      >
        <SearchIcon />
      </InputAdornment>
    );

    return [
      <TextField
        key="search-text-field"
        id="search-accounts"
        placeholder={this.context.t('searchAccounts')}
        type="text"
        value={this.state.searchQuery}
        onChange={(e) => this.setSearchQuery(e.target.value)}
        startAdornment={inputAdornment}
        fullWidth
        theme="material-white-padded"
      />,
      <div className="account-menu__divider" key="search-divider" />,
    ];
  }

  renderAccounts() {
    const {
      accounts,
      selectedAddress,
      keyrings,
      showAccountDetail,
      addressConnectedDomainMap,
      originOfCurrentTab,
      hwOnlyMode,
    } = this.props;
    const { searchQuery } = this.state;

    let filteredIdentities = accounts;
    if (searchQuery) {
      this.addressFuse.setCollection(accounts);
      filteredIdentities = this.addressFuse.search(searchQuery);
    }

    if (filteredIdentities.length === 0) {
      return (
        <p className="account-menu__no-accounts">
          {this.context.t('noAccountsFound')}
        </p>
      );
    }

    return filteredIdentities.map((identity) => {
      const isSelected = identity.address === selectedAddress;
      const keyring = getAccountKeyring({ account: identity, keyrings });
      const addressDomains = addressConnectedDomainMap[identity.address] || {};
      const iconAndNameForOpenDomain = addressDomains[originOfCurrentTab];

      return (
        <div
          className="account-menu__account account-menu__item--clickable"
          onClick={() => {
            this.context.trackEvent({
              eventOpts: {
                category: 'Navigation',
                action: 'Main Menu',
                name: 'Switched Account',
              },
            });
            showAccountDetail(identity.address);
          }}
          key={identity.address}
        >
          <div className="account-menu__check-mark">
            {isSelected && <div className="account-menu__check-mark-icon" />}
          </div>
          <Identicon address={identity.address} diameter={24} />
          <div className="account-menu__account-info">
            <div className="account-menu__name">{identity.name || ''}</div>
            <UserPreferencedCurrencyDisplay
              className="account-menu__balance"
              value={identity.balance}
              type={PRIMARY}
            />
          </div>
          {this.renderKeyringType(keyring)}
          {iconAndNameForOpenDomain ? (
            <div className="account-menu__icon-list">
              <SiteIcon
                icon={iconAndNameForOpenDomain.icon}
                name={iconAndNameForOpenDomain.name}
                size={32}
              />
            </div>
          ) : null}
        </div>
      );
    });
  }

  renderKeyringType(keyring) {
    if (!keyring) {
      return null;
    }
    const { t } = this.context;
    const accountType = keyringTypeToAccountType(keyring.type);

    let label;

    switch (accountType) {
      case WALLET_ACCOUNT_TYPES.HARDWARE:
        label = t('hardware');
        break;
      case WALLET_ACCOUNT_TYPES.IMPORTED:
        label = t('imported');
        break;
      case WALLET_ACCOUNT_TYPES.WATCHED:
        label = t('watched');
        break;
      default:
        return null;
    }

    return <div className="keyring-label allcaps">{label}</div>;
  }

  resetSearchQuery() {
    this.setSearchQuery('');
  }

  setSearchQuery(searchQuery) {
    this.setState({ searchQuery });
  }

  setShouldShowScrollButton = () => {
    if (!this.accountsRef) {
      return;
    }
    const { scrollTop, offsetHeight, scrollHeight } = this.accountsRef;

    const canScroll = scrollHeight > offsetHeight;

    const atAccountListBottom = scrollTop + offsetHeight >= scrollHeight;

    const shouldShowScrollButton = canScroll && !atAccountListBottom;

    this.setState({ shouldShowScrollButton });
  };

  onScroll = debounce(this.setShouldShowScrollButton, 25);

  handleScrollDown = (e) => {
    e.stopPropagation();

    const { scrollHeight } = this.accountsRef;
    this.accountsRef.scroll({ left: 0, top: scrollHeight, behavior: 'smooth' });

    this.setShouldShowScrollButton();
  };

  renderScrollButton() {
    if (!this.state.shouldShowScrollButton) {
      return null;
    }

    return (
      <div
        className="account-menu__scroll-button"
        onClick={this.handleScrollDown}
      >
        <img
          src="./images/icons/down-arrow.svg"
          width="28"
          height="28"
          alt={this.context.t('scrollDown')}
        />
      </div>
    );
  }

  render() {
    const { t, trackEvent } = this.context;
    const {
      shouldShowAccountsSearch,
      isAccountMenuOpen,
      toggleAccountMenu,
      lockMetamask,
      history,
      hwOnlyMode,
    } = this.props;

    if (!isAccountMenuOpen) {
      return null;
    }

    return (
      <div className="account-menu">
        <div className="account-menu__close-area" onClick={toggleAccountMenu} />
        <AccountMenuItem className="account-menu__header">
          {t('myAccounts')}

          {IS_ENV_IN_TEST_OR_DEBUG && (
            <button
              className="account-menu__lock-button"
              onClick={() => {
                toggleAccountMenu();
                history.push(RESTORE_VAULT_ROUTE);
                if (getEnvironmentType() === ENVIRONMENT_TYPE_POPUP) {
                  global.platform.openExtensionInBrowser(RESTORE_VAULT_ROUTE);
                }
              }}
            >
              重置插件
            </button>
          )}
          <button
            className="account-menu__lock-button"
            onClick={() => {
              lockMetamask();
              history.push(DEFAULT_ROUTE);
            }}
          >
            {t('lock')}
          </button>
        </AccountMenuItem>
        <div className="account-menu__divider" />
        <div className="account-menu__accounts-container">
          {shouldShowAccountsSearch ? this.renderAccountsSearch() : null}
          <div
            className="account-menu__accounts"
            onScroll={this.onScroll}
            ref={(ref) => {
              this.accountsRef = ref;
            }}
          >
            {this.renderAccounts()}
          </div>
          {this.renderScrollButton()}
        </div>
        <div className="account-menu__divider" />

        {!hwOnlyMode && (
          <>
            <AccountMenuItem
              onClick={() => {
                toggleAccountMenu();
                trackEvent({
                  eventOpts: {
                    category: 'Navigation',
                    action: 'Main Menu',
                    name: 'Clicked Create Account',
                  },
                });
                history.push(NEW_ACCOUNT_ROUTE);
              }}
              icon={
                <img
                  className="account-menu__item-icon"
                  src="images/plus-btn-white.svg"
                  alt={t('createAccount')}
                />
              }
              text={t('createAccount')}
            />
            <AccountMenuItem
              onClick={() => {
                toggleAccountMenu();
                trackEvent({
                  eventOpts: {
                    category: 'Navigation',
                    action: 'Main Menu',
                    name: 'Clicked Import Account',
                  },
                });
                history.push(IMPORT_ACCOUNT_ROUTE);
              }}
              icon={
                <img
                  className="account-menu__item-icon"
                  src="images/import-account.svg"
                  alt={t('importAccount')}
                />
              }
              text={t('importAccount')}
            />
          </>
        )}

        <AccountMenuItem
          onClick={() => {
            toggleAccountMenu();
            trackEvent({
              eventOpts: {
                category: 'Navigation',
                action: 'Main Menu',
                name: 'Clicked Connect Hardware',
              },
            });
            goToPageConnectHardware();
          }}
          icon={
            <img
              className="account-menu__item-icon"
              src="images/connect-icon.svg"
              alt={t('connectHardwareWallet')}
            />
          }
          text={t('connectHardwareWallet')}
        />
        <div className="account-menu__divider" />
        <AccountMenuItem
          onClick={() => {
            toggleAccountMenu();
            history.push(ABOUT_US_ROUTE);
          }}
          icon={<img src="images/mm-info-icon.svg" alt={t('infoHelp')} />}
          text={t('infoHelp')}
        />
        <AccountMenuItem
          onClick={() => {
            toggleAccountMenu();
            history.push(SETTINGS_ROUTE);
            this.context.trackEvent({
              eventOpts: {
                category: 'Navigation',
                action: 'Main Menu',
                name: 'Opened Settings',
              },
            });
          }}
          icon={
            <img
              className="account-menu__item-icon"
              src="images/settings.svg"
            />
          }
          text={t('settings')}
        />
      </div>
    );
  }
}
