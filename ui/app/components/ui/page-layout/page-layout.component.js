import React, { Component } from 'react';
import classnames from 'classnames';
import ExtAppNavBar from '../../../../../src/components/ExtAppNavBar';

const PageLayout = ({ title, subtitle, onBack, children, className }) => {
  return (
    <div className={classnames('page-layout', className)}>
      <ExtAppNavBar title={title} subTitle={subtitle} onBackClick={onBack} />
      <div className="page-layout__content">{children}</div>
    </div>
  );
};

export default PageLayout;
