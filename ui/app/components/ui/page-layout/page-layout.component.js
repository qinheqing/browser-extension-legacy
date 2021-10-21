import React, { Component } from 'react';

const PageLayout = ({ title, subtitle, onBack, children }) => {
  return (
    <div className="page-layout">
      <div className="page-layout__header">
        <div className="page-layout__back" onClick={onBack}>
          <img src="./images/caret-left-black.svg" />
          <div className="page-layout__divider" />
        </div>
        <div className="page-layout__messages">
          {title && <div className="page-layout__title">{title}</div>}
          {subtitle && <div className="page-layout__subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="page-layout__content">{children}</div>
    </div>
  );
};

export default PageLayout;
