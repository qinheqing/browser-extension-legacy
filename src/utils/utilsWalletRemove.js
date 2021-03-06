import extension from 'extensionizer';
import localforage from 'localforage';
import { random } from 'lodash';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../ui/app/helpers/constants/common';
import utilsApp from './utilsApp';

function deleteAllCookies() {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

async function removeAllData() {
  console.log('remove all data');

  try {
    await window.platform.closeAllSavedTabs();
  } catch (ex) {
    console.error(ex);
  }

  try {
    await deleteAllCookies();
  } catch (ex) {
    console.error(ex);
  }

  try {
    await global.localStorage.clear();
  } catch (ex) {
    console.error(ex);
  }

  try {
    await global.sessionStorage.clear();
  } catch (ex) {
    console.error(ex);
  }

  try {
    await extension.storage.local.clear();
  } catch (ex) {
    console.error(ex);
  }

  try {
    await extension.storage.sync.clear();
  } catch (ex) {
    console.error(ex);
  }

  try {
    await localforage.clear();
  } catch (ex) {
    console.error(ex);
  }
}

// sim remove failed and infinite re-remove after reload
function simRemoveFailed() {
  const r = random(0, 10);
  if (r < 7) {
    // eslint-disable-next-line no-alert
    alert(`Wallet remove failed: ${r}`);
    window.location.reload();
  }
}

function removeWallet() {
  // IS_ENV_IN_TEST_OR_DEBUG && simRemoveFailed();

  return new Promise((resolve) => {
    extension.runtime.getBackgroundPage((backgroundWindow) => {
      backgroundWindow.ONEKEY_DISABLE_AUTO_PERSIST_DATA = true;
      removeAllData().then(async () => {
        await removeAllData();
        backgroundWindow.location.reload();

        await utilsApp.delay(600);

        await removeAllData();
        resolve();
        window.location.reload();
      });
    });
  });
}

export default {
  removeWallet,
};
