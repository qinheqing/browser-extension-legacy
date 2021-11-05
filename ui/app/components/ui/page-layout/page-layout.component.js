import React, { Component } from 'react';
import classnames from 'classnames';

const PageLayout = ({ title, subtitle, onBack, children, className }) => {
  return (
    <div className={classnames('page-layout', className)}>
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
