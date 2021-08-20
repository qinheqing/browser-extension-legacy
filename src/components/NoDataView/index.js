import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function NoDataView({ fullHeight = false, children, className }) {
  return (
    <div
      className={classnames(
        {
          'u-flex-center flex-col': true,
          'h-full': fullHeight,
          'h-64': !fullHeight,
        },
        className,
      )}
    >
      <div className="text-xl text-gray-500">{children || '暂无数据'}</div>
    </div>
  );
}

NoDataView.propTypes = {
  children: PropTypes.any,
};

export default observer(NoDataView);
