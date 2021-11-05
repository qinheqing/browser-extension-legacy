import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import {
  NETWORK_TYPE_RPC,
  NETWORK_TYPE_TO_ID_MAP,
} from '../../../../../shared/constants/network';

import LoadingIndicator from '../../ui/loading-indicator';
import ColorIndicator from '../../ui/color-indicator';
import {
  COLORS,
  SIZES,
  TYPOGRAPHY,
} from '../../../helpers/constants/design-system';
import Chip from '../../ui/chip/chip';
import { NetworkIcon } from '../../ui/network-icon';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { isNetworkLoading } from '../../../selectors';

export default function NetworkDisplay({
  colored,
  outline,
  iconClassName,
  indicatorSize,
  disabled,
  labelProps,
  targetNetwork,
  onClick,
}) {
  const networkIsLoading = useSelector(isNetworkLoading);
  const currentNetwork = useSelector((state) => ({
    nickname: state.metamask.provider.nickname,
    chainType: state.metamask.provider.type,
  }));

  const t = useI18nContext();
  const { nickname: networkNickname, chainType: networkType } =
    targetNetwork ?? currentNetwork;

  return (
    <div className="network-display" onClick={onClick}>
      <NetworkIcon networkType={networkType} />
      <div className="network-display__content">
        {networkType === NETWORK_TYPE_RPC
          ? networkNickname ?? t('privateNetwork')
          : t(networkType)}
      </div>
      <i className="network-display__icon" />
    </div>
  );
}

NetworkDisplay.propTypes = {
  colored: PropTypes.bool,
  indicatorSize: PropTypes.oneOf(Object.values(SIZES)),
  labelProps: Chip.propTypes.labelProps,
  targetNetwork: PropTypes.shape({
    chainType: PropTypes.oneOf([
      ...Object.values(NETWORK_TYPE_TO_ID_MAP),
      NETWORK_TYPE_RPC,
    ]),
    nickname: PropTypes.string,
  }),
  outline: PropTypes.bool,
  disabled: PropTypes.bool,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func,
};

NetworkDisplay.defaultProps = {
  colored: true,
  indicatorSize: SIZES.LG,
};
