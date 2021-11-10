import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import NavBackButton from '../NavBackButton';
import styles from './index.css';

function ExtAppNavBar({ children, left, right, title, subTitle, onBackClick }) {
  const leftView =
    left === undefined ? (
      <NavBackButton onBackClick={onBackClick} className="-m-2" />
    ) : (
      left
    );
  return (
    <div
      data-name="ExtAppNavBar"
      className="bg-nav-bar px-3 py-2 min-h-[60px] flex flex-row items-center border-b"
    >
      {leftView && (
        <div className="min-w-8 flex justify-start border-r pr-2 mr-3">
          {leftView}
        </div>
      )}

      <div className="text-left flex-1">
        <div className="text-lg font-bold">{title}</div>
        {subTitle && (
          <div className="text-xs text-gray-400 leading-none">{subTitle}</div>
        )}
      </div>
      <div className="w-9 flex justify-end">{right}</div>
    </div>
  );
}

ExtAppNavBar.propTypes = {
  children: PropTypes.any,
};

export default observer(ExtAppNavBar);
