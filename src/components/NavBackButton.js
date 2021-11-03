import React from 'react';
import storeHistory from '../store/storeHistory';
import { ROUTE_HOME } from '../routes/routeUrls';
import AppIcons from './AppIcons';
import OneArrow from './OneArrow';

function NavBackButton() {
  return (
    <div
      className="p-2 -m-2"
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
