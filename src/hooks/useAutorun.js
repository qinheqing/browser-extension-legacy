import { useEffect } from 'react';

function useAutorun(autorun) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(autorun, []);
}

export default useAutorun;
