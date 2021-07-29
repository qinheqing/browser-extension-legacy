import { isString } from 'lodash';

global.$$errorNotificationAvailableCount = 5;

function showExtensionNotification(error) {
  const msg = isString(error) ? error : error?.message;
  let notificationId;
  if (global.$$errorNotificationAvailableCount <= 0) {
    // if availableCount is 0, use fixed notificationId,
    // so Chrome won't push more notification unless user clear them
    notificationId = `onekey-background-error-notification`;
    // return;
  }
  if (msg && global?.$$extensionPlatform?._showNotification) {
    global.$$errorNotificationAvailableCount -= 1;

    global.$$extensionPlatform._showNotification(
      `OneKey Error`,
      msg,
      notificationId, // notification id
    );
  }
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
