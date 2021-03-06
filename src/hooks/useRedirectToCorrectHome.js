import { useHistory, useLocation } from 'react-router-dom';
import utilsApp from '../utils/utilsApp';
import { SETTINGS_ROUTE } from '../../ui/app/helpers/constants/routes';
import { ROUTE_HOME, ROUTE_HOME_OLD } from '../routes/routeUrls';
import { getEnvironmentType } from '../../app/scripts/lib/util';
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../shared/constants/app';
import utilsStorage from '../utils/utilsStorage';
import storeStorage from '../store/storeStorage';

async function reloadPageIfChainNotMatched({ isPopup }) {
  const chainKeyInStorage = await utilsStorage.getAutoSaveStorageItemAsync({
    field: 'currentChainKey',
  });
  const chainKeyInMem = storeStorage.currentChainKey;
  if (
    chainKeyInMem &&
    chainKeyInStorage &&
    chainKeyInStorage !== chainKeyInMem &&
    !isPopup
  ) {
    window.location.reload();
  }
}

function redirectToCorrectHome({ fromNewHome = true, history, location }) {
  const envType = getEnvironmentType();
  const isPopup = envType === ENVIRONMENT_TYPE_POPUP;
  const isNotification = envType === ENVIRONMENT_TYPE_NOTIFICATION;

  // if Dapp create approve window (isNotification=true), do NOT redirect to new home
  if (isNotification) {
    return false;
  }

  if (fromNewHome) {
    if (utilsApp.isOldHome()) {
      // NewHome -> OldHome
      history.replace(ROUTE_HOME_OLD);
      // window.location.reload();
      return true;
    }
  } else {
    const { pathname } = location;
    const allowedViewInNewHomePath = [SETTINGS_ROUTE];
    if (
      utilsApp.isNewHome() &&
      // view pages in array, do NOT redirect
      !allowedViewInNewHomePath.find((item) => pathname.startsWith(item))
    ) {
      // OldHome -> NewHome
      history.replace(ROUTE_HOME);
      reloadPageIfChainNotMatched({ isPopup });
      return true;
    }
  }
  return false;
}

function useRedirectToCorrectHome({ fromNewHome = true }) {
  const history = useHistory();
  const location = useLocation();
  return redirectToCorrectHome({ fromNewHome, history, location });
}

export default useRedirectToCorrectHome;
export { redirectToCorrectHome };
