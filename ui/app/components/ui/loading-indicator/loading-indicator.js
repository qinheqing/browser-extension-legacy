import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export default function LoadingIndicator({
  alt,
  title,
  isLoading,
  children = null,
  size = 'md',
}) {
  return isLoading ? (
    <span
      className={cn('loading-indicator', {
        [`size-${size}`]: true,
      })}
    >
      <img
        className="loading-indicator__spinner"
        alt={alt}
        title={title}
        src="images/loading.svg"
      />
    </span>
  ) : (
    children
  );
}

LoadingIndicator.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  alt: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};
