import { Helmet } from 'react-helmet';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import classnames from 'classnames';
import { Portal } from '@headlessui/react';
import { Route } from 'react-router-dom';
import PreloadScreen from '../PreloadScreen';
import styles from './index.css';

// AppToastContainer should be singleton
function AppToastContainer() {
  return (
    <Portal>
      <ToastContainer />
    </Portal>
  );
}

function NewHomeRootComponents() {
  return (
    <>
      <Helmet>
        <link
          rel="stylesheet"
          type="text/css"
          href="./tailwind.css"
          title="ltr"
        />
      </Helmet>
      {/* LoadingScreen*/}
      <PreloadScreen />
    </>
  );
}

function OldHomeRootComponents() {
  return (
    <>
      <Helmet>
        <link rel="stylesheet" type="text/css" href="./index.css" title="ltr" />
        <link
          rel="stylesheet"
          type="text/css"
          href="./index-rtl.css"
          title="rtl"
          disabled
        />
      </Helmet>
      <PreloadScreen />
    </>
  );
}

export default function AppRootView({ children }) {
  return (
    <div className={classnames(styles.root, '')}>
      <div className={classnames(styles.content, '')}>
        <NewHomeRootComponents />
        {children}
      </div>
    </div>
  );
}

export { OldHomeRootComponents, AppToastContainer };
