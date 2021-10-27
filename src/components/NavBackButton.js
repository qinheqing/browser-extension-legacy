import React from 'react';
import storeHistory from '../store/storeHistory';
import { ROUTE_HOME } from '../routes/routeUrls';
import AppIcons from './AppIcons';
import OneArrow from './OneArrow';

function NavBackButton() {
  return (
    <OneArrow
      type="arrow"
      direction="left"
      role="button"
      className="w-6"
      classNameDefault=""
      // onClick={() => window.onekeyHistory.goBack()}
      onClick={() => storeHistory.goBack({ fallbackUrl: ROUTE_HOME })}
    />
  );
}

export default NavBackButton;
