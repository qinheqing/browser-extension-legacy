import { Helmet } from 'react-helmet';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import classnames from 'classnames';
import { Portal } from '@headlessui/react';
import { observer } from 'mobx-react-lite';
import PreloadScreen from '../PreloadingScreen';
import storeStorage from '../../store/storeStorage';
import storeApp from '../../store/storeApp';
import styles from './index.css';

function CssStyleInNew() {
  return (
    <>
      <Helmet>
        <link rel="stylesheet" type="text/css" href="./tailwind.css" />
        <link rel="stylesheet" type="text/css" href="./index.new.css" />
      </Helmet>
    </>
  );
}

function CssStyleInOld() {
  return (
    <Helmet>
      <link rel="stylesheet" type="text/css" href="./tailwind.css" />
      <link rel="stylesheet" type="text/css" href="./index.css" title="ltr" />
      <link
        rel="stylesheet"
        type="text/css"
        href="./index-rtl.css"
        title="rtl"
        disabled
      />
    </Helmet>
  );
}

function CssStyleInAll() {
  return (
    <Helmet>
      <link rel="stylesheet" type="text/css" href="./index.css" title="ltr" />
      <link
        rel="stylesheet"
        type="text/css"
        href="./index-rtl.css"
        title="rtl"
        disabled
      />

      <link rel="stylesheet" type="text/css" href="./tailwind.css" />
      {/* standalone page css at new home */}
      <link rel="stylesheet" type="text/css" href="./index.new.css" />
    </Helmet>
  );
}

// AppToastContainer should be singleton
function AppToastContainer() {
  return (
    <Portal>
      <ToastContainer />
    </Portal>
  );
}

function NewOldHomeSwitchLoading() {
  // return <PreloadScreen />;
  return null;
}

function NewHomeRootComponents() {
  return (
    <>
      {/* <CssStyleInNew />*/}
      {/* LoadingScreen*/}
      <NewOldHomeSwitchLoading />
    </>
  );
}

function OldHomeRootComponents() {
  return (
    <>
      {/* <CssStyleInOld />*/}
      <NewOldHomeSwitchLoading />
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
  if (!storeStorage.storageReady || !storeApp.metamaskStateReady) {
    return <PreloadScreen autoHideTimeout={false} />;
  }
  return (
    <>
      {/* <CssStyleInAll />*/}
      {children}
      {/* AppToastContainer should be singleton */}
      <AppToastContainer />
    </>
  );
});

export default AppRootView;
export { OldHomeRootComponents, UniversalRoutesWrapper };
