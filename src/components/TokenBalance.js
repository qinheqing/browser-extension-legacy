import React, { useEffect, useState } from 'react';
import { Observer } from 'mobx-react-lite';
import storeWallet from '../store/storeWallet';
import AmountText from './AmountText';

// eslint-disable-next-line react/prop-types
export default function TokenBalance({ wallet, address, contractAddress }) {
  const [accountInfo, setAccountInfo] = useState({});
  const _wallet = wallet || storeWallet.currentWallet;

  /*
  TODO balance tracker:
    1. read from cache
    2. update from chain
    3. write back to cache with throttle
    4. listener for balance auto update
  */
  useEffect(() => {
    (async () => {
      // eslint-disable-next-line react/prop-types
      const info = await _wallet.chainProvider.getAccountInfo({ address });
      setAccountInfo(info);
    })();
  }, [address, _wallet]);

  return (
    <Observer>
      {() => {
        return (
          <AmountText
            value={accountInfo.balance}
            decimals={accountInfo.decimals}
          />
        );
      }}
    </Observer>
  );
}
