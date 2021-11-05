import { useSelector } from 'react-redux';
import { getAccountType } from '../../ui/app/selectors';
import utilsApp from '../utils/utilsApp';
import { WALLET_ACCOUNT_TYPES } from '../../ui/app/helpers/constants/common';
import storeAccount from '../store/storeAccount';

function useCurrentAccountAvailable() {
  const accountType = useSelector(getAccountType);
  const hwOnlyMode = useSelector((state) => state?.metamask?.hwOnlyMode);

  if (utilsApp.isNewHome()) {
    return Boolean(storeAccount.currentAccountAddress);
  }

  if (accountType) {
    if (hwOnlyMode && accountType !== WALLET_ACCOUNT_TYPES.HARDWARE) {
      return false;
    }
    return true;
  }

  return false;
}

export default useCurrentAccountAvailable;
