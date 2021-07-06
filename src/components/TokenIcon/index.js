import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function TokenIcon({ tokenInfo, className, children }) {
  return (
    <div
      className={classnames(
        'inline-block w-7 h-7 rounded-full bg-gray-50 border',
        className,
      )}
    >
      {children}
    </div>
  );
}

TokenIcon.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenIcon);
