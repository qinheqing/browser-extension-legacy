import React from 'react';
import classnames from 'classnames';
import NavBackButton from '../NavBackButton';
import ExtAppNavBar from '../ExtAppNavBar';
import styles from './index.css';

// eslint-disable-next-line react/prop-types
export default function AppPageLayout({
  header = null,
  title = 'OneKey',
  subTitle = '',
  navLeft,
  navRight,
  showBack = true,
  whiteBg = false,
  children,
  footer,
}) {
  console.log('AppPageLayout render');
  const showNavBar = !header;
  return (
    <div className={styles.root}>
      {showNavBar && (
        <ExtAppNavBar
          title={title}
          left={navLeft}
          right={navRight}
          subTitle={subTitle}
        />
      )}
      {header}
      <div
        data-name="AppPageLayoutBody"
        className={classnames(
          'OneKey-AppPageLayoutBody',
          styles.body,
          whiteBg && 'bg-white',
        )}
      >
        {children}
      </div>

      <div data-name="AppPageLayoutFooter">{footer}</div>
    </div>
  );
}
