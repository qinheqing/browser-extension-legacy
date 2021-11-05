import utilsToast from './utilsToast';

// node_modules/@sentry/utils/dist/instrument.js

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
    utilsToast.toastError(event.reason);
  });

  console.log('window.addEventListener#error');
  window.addEventListener('error', (event) => {
    console.log('window.addEventListener on [error]');
    utilsToast.toastError(event.error);
  });
}

export default {
  init,
};
