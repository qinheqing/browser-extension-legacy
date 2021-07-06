import React from 'react';
import AppIcons from './AppIcons';

function NavBackButton() {
  return (
    <AppIcons.ArrowLeftIcon
      role="button"
      className="w-6"
      onClick={() => window.onekeyHistory.goBack()}
    />
  );
}

export default NavBackButton;
