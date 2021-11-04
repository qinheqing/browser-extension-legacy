import React from 'react';
import classnames from 'classnames';
import storeHistory from '../store/storeHistory';
import { ROUTE_HOME } from '../routes/routeUrls';
import AppIcons from './AppIcons';
import OneArrow from './OneArrow';

function NavBackButton({ className }) {
  return (
    <div
      className={classnames('p-2', className)}
      role="button"
      // onClick={() => window.onekeyHistory.goBack()}
      onClick={() => storeHistory.goBack({ fallbackUrl: ROUTE_HOME })}
    >
      <OneArrow
        type="chevron"
        direction="left"
        className="w-6"
        classNameDefault=""
      />
    </div>
  );
}

export default NavBackButton;
