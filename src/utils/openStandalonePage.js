import uiGetBgControllerAsync from '../wallets/bg/uiGetBgControllerAsync';
import utilsApp from './utilsApp';

function closeCurrentWindow() {
  if (utilsApp.isUiEnvironment()) {
    window.close();
  }
}

async function openStandalonePage(routeUrl, target = '') {
  if (utilsApp.isBackgroundEnvironment()) {
    global.platform.openExtensionInBrowser(routeUrl, null, target);
    closeCurrentWindow();
    return;
  }

  if (utilsApp.isPopupEnvironment()) {
    const bg = await uiGetBgControllerAsync();
    bg.openExtensionInBrowser(routeUrl, null, target);
    closeCurrentWindow();
    return;
  }
  global.onekeyHistory.push(routeUrl);
}

export default openStandalonePage;
