import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import * as actions from '../../../store/actions';
import { openAlert as displayInvalidCustomNetworkAlert } from '../../../ducks/alerts/invalid-custom-network';
import {
  NETWORKS_ROUTE,
  NETWORKS_FORM_ROUTE,
} from '../../../helpers/constants/routes';
import { ENVIRONMENT_TYPE_FULLSCREEN } from '../../../../../shared/constants/app';
import { NETWORK_TYPE_RPC } from '../../../../../shared/constants/network';
import { isPrefixedFormattedHexString } from '../../../../../shared/modules/network.utils';
import { getEnvironmentType } from '../../../../../app/scripts/lib/util';

import ColorIndicator from '../../ui/color-indicator';
import { COLORS, SIZES } from '../../../helpers/constants/design-system';
import storeHistory from '../../../../../src/store/storeHistory';
import { NetworkIcon } from '../../ui/network-icon';
import PopoverBeta from '../../ui/popover-beta';
import { Dropdown, DropdownMenuItem } from './components/dropdown';

const DROP_DOWN_MENU_ITEM_STYLE = {
  fontSize: '16px',
  lineHeight: '20px',
  padding: '12px 0',
};

function mapStateToProps(state) {
  return {
    provider: state.metamask.provider,
    frequentRpcListDetail: state.metamask.frequentRpcListDetail || [],
    networkDropdownOpen: state.appState.networkDropdownOpen,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setProviderType: (type) => {
      dispatch(actions.setProviderType(type));
    },
    setRpcTarget: (target, chainId, ticker, nickname) => {
      dispatch(actions.setRpcTarget(target, chainId, ticker, nickname));
    },
    hideNetworkDropdown: () => dispatch(actions.hideNetworkDropdown()),
    setNetworksTabAddMode: (isInAddMode) => {
      dispatch(actions.setNetworksTabAddMode(isInAddMode));
    },
    setSelectedSettingsRpcUrl: (url) => {
      dispatch(actions.setSelectedSettingsRpcUrl(url));
    },
    displayInvalidCustomNetworkAlert: (networkName) => {
      dispatch(displayInvalidCustomNetworkAlert(networkName));
    },
    showConfirmDeleteNetworkModal: ({ target, onConfirm }) => {
      return dispatch(
        actions.showModal({
          name: 'CONFIRM_DELETE_NETWORK',
          target,
          onConfirm,
        }),
      );
    },
  };
}

class NetworkDropdown extends Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    provider: PropTypes.shape({
      nickname: PropTypes.string,
      rpcUrl: PropTypes.string,
      type: PropTypes.string,
      ticker: PropTypes.string,
    }).isRequired,
    setProviderType: PropTypes.func.isRequired,
    setRpcTarget: PropTypes.func.isRequired,
    hideNetworkDropdown: PropTypes.func.isRequired,
    setNetworksTabAddMode: PropTypes.func.isRequired,
    setSelectedSettingsRpcUrl: PropTypes.func.isRequired,
    frequentRpcListDetail: PropTypes.array.isRequired,
    networkDropdownOpen: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    displayInvalidCustomNetworkAlert: PropTypes.func.isRequired,
    showConfirmDeleteNetworkModal: PropTypes.func.isRequired,
  };

  handleClick(newProviderType) {
    const {
      provider: { type: providerType },
      setProviderType,
    } = this.props;
    const { trackEvent } = this.context;

    trackEvent({
      eventOpts: {
        category: 'Navigation',
        action: 'Home',
        name: 'Switched Networks',
      },
      customVariables: {
        fromNetwork: providerType,
        toNetwork: newProviderType,
      },
    });
    setProviderType(newProviderType);
  }

  renderCustomRpcList(rpcListDetail, provider) {
    const reversedRpcListDetail = rpcListDetail.slice().reverse();

    return reversedRpcListDetail.map((entry) => {
      const { rpcUrl, chainId, ticker = 'ETH', nickname = '' } = entry;
      const isCurrentRpcTarget =
        provider.type === NETWORK_TYPE_RPC && rpcUrl === provider.rpcUrl;

      return (
        <DropdownMenuItem
          key={`common${rpcUrl}`}
          closeMenu={() => this.props.hideNetworkDropdown()}
          onClick={() => {
            if (isPrefixedFormattedHexString(chainId)) {
              this.props.setRpcTarget(rpcUrl, chainId, ticker, nickname);
            } else {
              this.props.displayInvalidCustomNetworkAlert(nickname || rpcUrl);
            }
          }}
        >
          <NetworkIcon networkType="mainnet" />
          <span
            className="network-name-item"
            style={{
              color: isCurrentRpcTarget ? '#000' : '#9b9b9b',
            }}
          >
            {nickname || rpcUrl}
          </span>
          {isCurrentRpcTarget ? (
            <i className="fa fa-check" style={{ color: '#00b812' }} />
          ) : (
            <div className="network-check__transparent">✓</div>
          )}
        </DropdownMenuItem>
      );
    });
  }

  getNetworkName() {
    const { provider } = this.props;
    const providerName = provider.type;

    let name;

    if (providerName === 'mainnet') {
      name = this.context.t('mainnet');
    } else if (providerName === 'ropsten') {
      name = this.context.t('ropsten');
    } else if (providerName === 'kovan') {
      name = this.context.t('kovan');
    } else if (providerName === 'rinkeby') {
      name = this.context.t('rinkeby');
    } else if (providerName === 'goerli') {
      name = this.context.t('goerli');
    } else {
      name = provider.nickname || this.context.t('unknownNetwork');
    }

    return name;
  }

  renderNewAppEntry() {
    const { history } = this.props;
    return (
      <DropdownMenuItem
        closeMenu={this.props.hideNetworkDropdown}
        onClick={() => {
          storeHistory.goToHomeNew();
        }}
        style={DROP_DOWN_MENU_ITEM_STYLE}
      >
        <NetworkIcon networkType="solana" />
        <span className="network-name-item">{this.context.t('solana')}</span>
      </DropdownMenuItem>
    );
  }

  renderNetworkEntry(network) {
    const {
      provider: { type: providerType },
    } = this.props;
    return (
      <DropdownMenuItem
        key={network}
        closeMenu={this.props.hideNetworkDropdown}
        onClick={() => this.handleClick(network)}
        style={DROP_DOWN_MENU_ITEM_STYLE}
      >
        <NetworkIcon networkType={network} />
        <span className="network-name-item">{this.context.t(network)}</span>
        {providerType === network ? (
          <i className="fa fa-check" style={{ color: '#12121E' }} />
        ) : (
          <div className="network-check__transparent">✓</div>
        )}
      </DropdownMenuItem>
    );
  }

  render() {
    const {
      provider: { rpcUrl: activeNetwork },
      setNetworksTabAddMode,
      setSelectedSettingsRpcUrl,
      hideNetworkDropdown,
    } = this.props;
    const rpcListDetail = this.props.frequentRpcListDetail;
    const isOpen = this.props.networkDropdownOpen;

    return (
      isOpen && (
        <PopoverBeta onClose={hideNetworkDropdown}>
          <div style={{ padding: '20px' }}>
            {this.renderNetworkEntry('mainnet')}
            {this.renderNetworkEntry('bsc')}
            {this.renderNetworkEntry('heco')}
            {this.renderNetworkEntry('okex')}
            {this.renderNetworkEntry('matic')}
            {this.renderNetworkEntry('fantom')}
            {this.renderNetworkEntry('xdai')}
            {this.renderNetworkEntry('avalanche')}
            {this.renderNewAppEntry()}
            {this.renderNetworkEntry('ropsten')}
            {this.renderNetworkEntry('kovan')}
            {this.renderNetworkEntry('rinkeby')}
            {this.renderCustomRpcList(rpcListDetail, this.props.provider)}
          </div>
        </PopoverBeta>
      )
    );
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(NetworkDropdown);
