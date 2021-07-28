import React from 'react';
import classnames from 'classnames';
import NavBackButton from '../NavBackButton';
import styles from './index.css';

// eslint-disable-next-line react/prop-types
export default function AppPageLayout({
  title = 'OneKey',
  navLeft,
  navRight,
  showBack = true,
  whiteBg = false,
  children,
  footer,
}) {
  console.log('AppPageLayout render');
  return (
    <div className={styles.root}>
      <div
        data-name="AppPageLayoutHeader"
        className="bg-nav-bar px-3 h-11 flex flex-row items-center border-b"
      >
        <div className="w-9 flex justify-start">
          {navLeft === undefined ? <NavBackButton /> : navLeft}
        </div>
        <div className="text-center flex-1">{title}</div>
        <div className="w-9 flex justify-end">{navRight}</div>
      </div>

      <div
        data-name="AppPageLayoutBody"
        className={classnames(styles.body, whiteBg && 'bg-white')}
      >
        {children}
      </div>

      <div data-name="AppPageLayoutFooter">{footer}</div>
    </div>
  );
}
