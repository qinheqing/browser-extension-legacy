import { useEffect, useState } from 'react';
import storeAccount from '../store/storeAccount';

function useInitFirstAccount() {
  const [initAccountReady, setInitAccountReady] = useState(false);

  useEffect(() => {
    (async () => {
      await storeAccount.initFirstAccount();
      setInitAccountReady(true);
    })();
  }, []);

  return initAccountReady;
}

export default useInitFirstAccount;
