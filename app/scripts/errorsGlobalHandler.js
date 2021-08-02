import { isString } from 'lodash';

function showExtensionNotification(error) {
  const msg = isString(error) ? error : error.message;

  const showNotification = global?.$$extensionPlatform?._showNotification;
  return (
    showNotification &&
    msg &&
    showNotification(
      'OneKey Error',
      msg,
      // 'OneKey background global error handler', // notification id
    )
  );
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
    showExtensionNotification(event.reason);
  });

  console.log('window.addEventListener#error');
  window.addEventListener('error', (event) => {
    console.log('window.addEventListener on error');
    showExtensionNotification(event.error);
  });
}

export default {
  init,
};
