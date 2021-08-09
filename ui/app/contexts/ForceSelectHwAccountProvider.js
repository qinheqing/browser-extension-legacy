import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { actionAutoSelectHwAccountInHwOnlyModeAsync } from '../store/actions';

export default function ForceSelectHwAccountProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(actionAutoSelectHwAccountInHwOnlyModeAsync()).then(() => {
      setIsReady(true);
    });
  }, [dispatch]);

  if (!isReady) {
    return <div />;
  }
  return children;
}
