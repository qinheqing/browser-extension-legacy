import { Helmet } from 'react-helmet';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import classnames from 'classnames';
import { Portal } from '@headlessui/react';
import styles from './index.css';

export default function AppRootView({ children }) {
  return (
    <div className={classnames(styles.root, '')}>
      <Helmet>
        <link
          rel="stylesheet"
          type="text/css"
          href="./tailwind.css"
          title="ltr"
        />
      </Helmet>
      <div className={styles.content}>
        <Portal>
          <ToastContainer />
        </Portal>
        {children}
      </div>
    </div>
  );
}
