import React from 'react';
import classnames from 'classnames';
import storeHistory from '../store/storeHistory';
import { ROUTE_HOME } from '../routes/routeUrls';
import AppIcons from './AppIcons';
import OneArrow from './OneArrow';

function NavBackButton({ className, onBackClick }) {
  return (
    <div
      className={classnames('p-2', className)}
      role="button"
      // onClick={() => window.onekeyHistory.goBack()}
      onClick={() => {
        if (onBackClick) {
          onBackClick();
        } else {
          storeHistory.goBack({ fallbackUrl: ROUTE_HOME });
        }
      }}
    >
      <OneArrow
        type="chevron"
        direction="left"
        className="w-6 text-gray-500 hover:text-gray-800"
        classNameDefault=""
      />
    </div>
  );
}

export default NavBackButton;
