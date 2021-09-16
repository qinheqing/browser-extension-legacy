import { isString } from 'lodash';
import i18nBackground from './i18nBackground';

global.$$errorNotificationAvailableCount = 5;

async function showExtensionNotification(error) {
  let msg = isString(error) ? error : error?.message;
  const errorCodeI18n = error.errorCodeI18n || '';
  if (errorCodeI18n) {
    msg = i18nBackground.t(errorCodeI18n) || msg;
    console.error('errorCodeI18n: ', errorCodeI18n);
  }
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

// ignore list
/*
{
  code: -32603,
  message: 'Internal JSON-RPC error.'
}
 */

export default {
  init,
};
