import { useCallback, useState } from 'react';

function useLoadingCallback(asyncFunction) {
  const [loading, setLoading] = useState(false);
  const func = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        await asyncFunction(...args);
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction],
  );
  return [func, loading];
}

export default useLoadingCallback;
