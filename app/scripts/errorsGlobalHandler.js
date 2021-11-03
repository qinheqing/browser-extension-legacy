import { isString } from 'lodash';
import errorsIgnore from '../../src/utils/errorsIgnore';
import i18nBackground from './i18nBackground';

global.$$errorNotificationAvailableCount = 5;
let lastErrorMsg = '';

async function showExtensionNotification(error) {
  let msg = isString(error) ? error : error?.message;
  const errorCodeI18n = error.errorCodeI18n || '';
  const errorUrl = error.errorUrl || '';

  if (errorCodeI18n) {
    // should use t0(key) return empty if key has no translation
    msg = i18nBackground.t0(errorCodeI18n) || msg;
    console.error('errorCodeI18n: ', errorCodeI18n);
  }

  let notificationId;

  if (msg && global?.$ok_extensionPlatform?._showNotification) {
    if (
      errorsIgnore.ignoreNotification({
        error,
        message: msg,
        errorCodeI18n,
        errorUrl,
      })
    ) {
      return;
    }

    if (lastErrorMsg === msg) {
      global.$$errorNotificationAvailableCount -= 1;
    } else {
      global.$$errorNotificationAvailableCount = 5;
    }
    lastErrorMsg = msg;

    if (global.$$errorNotificationAvailableCount <= 0 && !errorUrl) {
      global.$$errorNotificationAvailableCount = 0;
      // if availableCount is 0, use fixed notificationId,
      // so Chrome won't push more notification unless user clear them
      notificationId = `onekey-background-error-notification`;
      return;
    }

    if (errorUrl) {
      notificationId = errorUrl;
    }

    global.$ok_extensionPlatform._subscribeToNotificationClicked();
    global.$ok_extensionPlatform._showNotification(
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
    console.log('window.addEventListener on [unhandledrejection]');
    showExtensionNotification(event.reason);
  });

  console.log('window.addEventListener#error');
  // TODO background normal error NOT handled here
  window.addEventListener('error', (event) => {
    console.log('window.addEventListener on [error]');
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
