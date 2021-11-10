import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import { Badge, Icon } from '@onekeyhq/ui-components';
import cx from 'classnames';
import { CONST_ACCOUNT_TYPES } from '../../consts/consts';
import storeAccount from '../../store/storeAccount';
import { WALLET_ACCOUNT_TYPES } from '../../../ui/app/helpers/constants/common';
import styles from './index.css';

function getAccountTypeColor(_type) {
  let color = 'default';

  switch (_type) {
    case CONST_ACCOUNT_TYPES.Hardware:
    case WALLET_ACCOUNT_TYPES.HARDWARE: {
      color = 'success'; // green
      break;
    }

    case CONST_ACCOUNT_TYPES.WatchOnly:
    case WALLET_ACCOUNT_TYPES.WATCHED: {
      color = 'default'; // gray
      break;
    }

    case CONST_ACCOUNT_TYPES.SingleChain:
    case WALLET_ACCOUNT_TYPES.IMPORTED: {
      color = 'warning'; // yellow
      break;
    }

    case CONST_ACCOUNT_TYPES.Wallet:
    case WALLET_ACCOUNT_TYPES.DEFAULT: {
      color = 'info'; // blue
      break;
    }

    default: {
      color = 'default';
    }
  }
  return color;
}

function ExtAccountTypeBadge({ children, type }) {
  const typeText = storeAccount.getAccountTypeText(type);
  const isHardWare =
    type === CONST_ACCOUNT_TYPES.Hardware ||
    type === WALLET_ACCOUNT_TYPES.HARDWARE;
  return (
    <Badge type={getAccountTypeColor(type)} className="">
      {isHardWare && (
        <Icon
          name="DeviceMobileOutline"
          className={cx('mr-1', !isHardWare && 'opacity-0')}
          size={16}
        />
      )}
      <span className="">{typeText}</span>
    </Badge>
  );
}

ExtAccountTypeBadge.propTypes = {
  children: PropTypes.any,
};

export default observer(ExtAccountTypeBadge);
