import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import OneCellItem from '../OneCellItem';
import OneInput from '../OneInput';
import styles from './index.css';

function OneFieldInputItem({
  value,
  onChange,
  placeholder,
  inputProps,
  border,
  ...others
}) {
  return (
    <OneFieldItem border={border} {...others}>
      <OneInput
        bgTransparent
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...inputProps}
      />
    </OneFieldItem>
  );
}

function OneFieldItem({
  title,
  titleWrapped = false,
  end,
  arrow = false,
  className,
  border = false,
  ...others
}) {
  const titleView = title && (
    <div
      className={classnames('text-sm inline-block', {
        'bg-gray-100 rounded-full px-2 py-0 ': titleWrapped,
      })}
    >
      {title}
    </div>
  );
  const endView = end && <div className="text-sm">{end}</div>;
  return (
    <OneCellItem
      title={titleView}
      end={endView}
      className={classnames('', className)}
      arrow={arrow}
      border={border}
      {...others}
    />
  );
}

function OneField({ children }) {
  return <div className="bg-white my-4">{children}</div>;
}

export { OneField, OneFieldItem, OneFieldInputItem };
