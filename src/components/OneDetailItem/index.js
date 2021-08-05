import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function OneDetailItemGroup({ children, divide = true, className }) {
  return (
    <div
      className={classnames(
        {
          'divide-y': divide,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

function OneDetailItem({
  alignY = false,
  title,
  content,
  children,
  bold = false,
  compact = false,
}) {
  return (
    <div
      className={classnames(
        'flex items-start justify-between text-sm ',
        bold && 'font-bold',
        compact ? 'py-1' : 'py-3',
        {
          'flex-col': alignY,
        },
      )}
    >
      <div className="text-gray-400 text-xs leading-5 flex-shrink-0">
        {title}
      </div>
      <div
        className={classnames('text-black u-break-words', {
          'ml-4 text-right': !alignY,
          'mt-1': alignY,
        })}
      >
        {children || content}
      </div>
    </div>
  );
}

export default OneDetailItem;
export { OneDetailItemGroup };
