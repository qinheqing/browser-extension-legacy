import React from 'react';
import BackButton from '../BackButton';

// eslint-disable-next-line react/prop-types
export default function AppFrame({ showBack = true, children }) {
  return (
    <div className="oneAppFrame">
      {showBack && (
        <div>
          <BackButton />
        </div>
      )}
      {children}
    </div>
  );
}
