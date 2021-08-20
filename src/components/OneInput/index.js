import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { isString } from 'lodash';
import AppIcons from '../AppIcons';
import styles from './index.css';

function OneInputIcon({ name }) {
  if (name === 'search') {
    return <AppIcons.SearchIcon className="w-4" />;
  }
  return name;
}

function OneInput({
  value,
  onChange,
  start,
  end,
  icon,
  label,
  placeholder,
  bgTransparent = false,
  className,
  ...others
}) {
  let iconEle = icon;
  if (isString(icon)) {
    iconEle = <OneInputIcon name={icon} />;
  }
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={classnames('relative rounded-md flex items-center', {
          'shadow-sm bg-gray-200 border-gray-300 px-2 py-1.5': !bgTransparent,
        })}
      >
        {iconEle && (
          <div className="pr-2 flex items-center pointer-events-none">
            {iconEle}
          </div>
        )}
        <input
          type="text"
          className={classnames(
            'flex-1 outline-none bg-transparent text-sm leading-6',
            className,
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...others}
        />
        {/* TODO clearable button */}
        {end && <div className="pl-2">{end}</div>}
      </div>
    </div>
  );
}

OneInput.propTypes = {
  children: PropTypes.any,
};

export default OneInput;
