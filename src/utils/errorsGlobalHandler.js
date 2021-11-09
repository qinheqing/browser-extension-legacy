import utilsToast from './utilsToast';
import errorsIgnore from './errorsIgnore';
import utilsApp from './utilsApp';

// node_modules/@sentry/utils/dist/instrument.js

function showErrorToast(error) {
  if (utilsApp.isOldHome()) {
    return;
  }

  if (
    errorsIgnore.ignoreNotification({
      error,
      message: error?.message,
    })
  ) {
    return;
  }
  utilsToast.toastError(error);
}

function init() {
  window.addEventListener('unhandledrejection', function (event) {
    // console.error(
    //   'Unhandled rejection (promise: ',
    //   event.promise,
    //   ', reason: ',
    //   event.reason,
    //   ').',
    // );
    console.log('window.addEventListener on [unhandledrejection]');
    showErrorToast(event.reason);
  });

  console.log('window.addEventListener#error');
  window.addEventListener('error', (event) => {
    console.log('window.addEventListener on [error]');
    showErrorToast(event.error);
  });
}

export default {
  init,
};
