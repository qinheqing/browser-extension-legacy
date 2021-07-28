import React from 'react';
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
      onClick={() => window.onekeyHistory.goBack()}
    />
  );
}

export default NavBackButton;
