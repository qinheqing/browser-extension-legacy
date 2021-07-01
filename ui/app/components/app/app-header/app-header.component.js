import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Identicon from '../../ui/identicon';
import MetaFoxLogo from '../../ui/metafox-logo';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import NetworkDisplay from '../network-display';
import { ROUTE_HOME } from '../../../../../src/routes/routeUrls';
import storeApp from '../../../../../src/store/storeApp';

export default class AppHeader extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    networkDropdownOpen: PropTypes.bool,
    showNetworkDropdown: PropTypes.func,
    hideNetworkDropdown: PropTypes.func,
    toggleAccountMenu: PropTypes.func,
    selectedAddress: PropTypes.string,
    isUnlocked: PropTypes.bool,
    hideNetworkIndicator: PropTypes.bool,
    disabled: PropTypes.bool,
    disableNetworkIndicator: PropTypes.bool,
    isAccountMenuOpen: PropTypes.bool,
    onClick: PropTypes.func,
    accounts: PropTypes.array,
  };

  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  handleNetworkIndicatorClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const {
      networkDropdownOpen,
      showNetworkDropdown,
      hideNetworkDropdown,
      disabled,
      disableNetworkIndicator,
    } = this.props;

    if (disabled || disableNetworkIndicator) {
      return;
    }

    if (networkDropdownOpen === false) {
      this.context.metricsEvent({
        eventOpts: {
          category: 'Navigation',
          action: 'Home',
          name: 'Opened Network Menu',
        },
      });
      showNetworkDropdown();
    } else {
      hideNetworkDropdown();
    }
  }

  renderAccountMenu() {
    const {
      isUnlocked,
      toggleAccountMenu,
      selectedAddress,
      disabled,
      isAccountMenuOpen,
      accounts,
    } = this.props;

    return (
      isUnlocked && (
        <div
          className={classnames('account-menu__icon', {
            'account-menu__icon--disabled': disabled,
          })}
          onClick={() => {
            if (!disabled) {
              !isAccountMenuOpen &&
                this.context.metricsEvent({
                  eventOpts: {
                    category: 'Navigation',
                    action: 'Home',
                    name: 'Opened Main Menu',
                  },
                });
              toggleAccountMenu();
            }
          }}
        >
          <Identicon address={selectedAddress} diameter={20} addBorder />
          <span className="account-menu__address">
            {accounts && accounts.length > 0 ? selectedAddress.slice(-4) : ''}
          </span>
          <span className="app-header__network-down-arrow app-header__account-down-arrow"></span>
        </div>
      )
    );
  }

  render() {
    const {
      history,
      isUnlocked,
      hideNetworkIndicator,
      disableNetworkIndicator,
      disabled,
      onClick,
    } = this.props;

    return (
      <div
        className={classnames('app-header', {
          'app-header--back-drop': isUnlocked,
        })}
      >
        <div className="app-header__contents">
          <MetaFoxLogo
            unsetIconHeight
            onClick={async () => {
              if (onClick) {
                await onClick();
              }
              history.push(DEFAULT_ROUTE);
            }}
          />
          <div className="app-header__account-menu-container">
            <button
              onClick={() => {
                storeApp.homeType = 'NEW';
                history.push(ROUTE_HOME);
              }}
            >
              Solana
            </button>
            {!hideNetworkIndicator && (
              <div className="app-header__network-component-wrapper">
                <NetworkDisplay
                  colored={false}
                  outline
                  iconClassName="app-header__network-down-arrow"
                  onClick={(event) => this.handleNetworkIndicatorClick(event)}
                  disabled={disabled || disableNetworkIndicator}
                />
              </div>
            )}
            {this.renderAccountMenu()}
          </div>
        </div>
      </div>
    );
  }
}
