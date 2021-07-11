import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function TokenIcon({ tokenInfo, size = 'md', className, children }) {
  return (
    <div
      className={classnames(
        ' rounded-full overflow-hidden bg-gray-50 border border-gray-100',
        {
          'w-8 h-8': size === 'md',
          'w-6 h-6': size === 'sm',
        },
      )}
    >
      <img
        className="max-h-full max-w-full"
        src={tokenInfo?.logoURI || tokenInfo?.icon}
      />
    </div>
  );
}

TokenIcon.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenIcon);
