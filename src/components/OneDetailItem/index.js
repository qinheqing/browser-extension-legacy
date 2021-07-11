import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function OneDetailItem({ title, content, children, bold = false }) {
  return (
    <div
      className={classnames(
        'flex items-start justify-between text-sm py-3',
        bold && 'font-bold',
      )}
    >
      <div className="text-gray-400 text-xs leading-5 flex-shrink-0">
        {title}
      </div>
      <div className="text-black ml-4 text-right">{children || content}</div>
    </div>
  );
}

export default OneDetailItem;
