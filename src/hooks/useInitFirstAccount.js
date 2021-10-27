import { useEffect, useState } from 'react';
import storeAccount from '../store/storeAccount';
import utilsApp from '../utils/utilsApp';

function useInitFirstAccount({ delay = 0 } = {}) {
  const [initAccountReady, setInitAccountReady] = useState(false);

  useEffect(() => {
    (async () => {
      await storeAccount.initFirstAccount();
      await utilsApp.delay(delay);
      setInitAccountReady(true);
    })();
  }, []);

  return initAccountReady;
}

export default useInitFirstAccount;
