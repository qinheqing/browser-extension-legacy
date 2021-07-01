import React from 'react';

function BackButton() {
  return (
    <button onClick={() => window.onekeyHistory.goBack()}>&lt; Back</button>
  );
}

export default BackButton;
