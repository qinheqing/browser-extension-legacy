import extension from 'extensionizer';
import localforage from 'localforage';
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

function removeWallet() {
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
