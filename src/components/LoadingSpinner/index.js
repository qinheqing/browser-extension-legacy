import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import AppIcons from '../AppIcons';
import styles from './index.css';

function LoadingSpinner({ fullHeight = false, className = 'w-11', children }) {
  // https://tailwindcss.com/docs/animation
  return (
    <div
      className={classnames({
        'inline-flex': !fullHeight,
        'u-flex-center h-full': fullHeight,
      })}
    >
      <AppIcons.SpinnerIcon
        className={classnames(
          'animate-spin animate-duration-500 text-green-500',
          className,
        )}
      />
    </div>
  );
}

LoadingSpinner.propTypes = {
  children: PropTypes.any,
};

export default observer(LoadingSpinner);
