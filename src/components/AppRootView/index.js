import { Helmet } from 'react-helmet';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import classnames from 'classnames';
import { Portal } from '@headlessui/react';
import { observer } from 'mobx-react-lite';
import PreloadScreen from '../PreloadingScreen';
import storeStorage from '../../store/storeStorage';
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
        <link rel="stylesheet" type="text/css" href="./tailwind.css" />
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
        {/* <link rel="stylesheet" type="text/css" href="./tailwind.css" /> */}
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

function AppRootView({ children }) {
  return (
    <div className={classnames(styles.root, '')}>
      <div className={classnames(styles.content, '')}>
        <NewHomeRootComponents />
        {children}
      </div>
    </div>
  );
}

const UniversalRoutesWrapper = observer(function ({ children }) {
  if (!storeStorage.storageReady) {
    return <PreloadScreen autoHideTimeout={false} />;
  }
  return (
    <>
      {children}
      {/* AppToastContainer should be singleton */}
      <AppToastContainer />
    </>
  );
});

export default AppRootView;
export { OldHomeRootComponents, UniversalRoutesWrapper };
