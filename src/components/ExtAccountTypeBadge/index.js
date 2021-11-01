import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import { Badge, Icon } from '@onekeyhq/ui-components';
import cx from 'classnames';
import { CONST_ACCOUNT_TYPES } from '../../consts/consts';
import storeAccount from '../../store/storeAccount';
import styles from './index.css';

function ExtAccountTypeBadge({ children, type }) {
  // TODO old type, new type
  const typeText = storeAccount.getAccountTypeText(type);
  const isHardWare = type === CONST_ACCOUNT_TYPES.Hardware;
  return (
    <Badge type="success" className="">
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
