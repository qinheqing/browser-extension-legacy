import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function OneDetailItem({
  alignY = false,
  title,
  content,
  children,
  bold = false,
}) {
  return (
    <div
      className={classnames(
        'flex items-start justify-between text-sm py-3',
        bold && 'font-bold',
        {
          'flex-col': alignY,
        },
      )}
    >
      <div className="text-gray-400 text-xs leading-5 flex-shrink-0">
        {title}
      </div>
      <div
        className={classnames('text-black ', {
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
