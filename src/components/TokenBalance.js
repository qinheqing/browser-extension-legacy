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
    - read from cache
    - read from chain
    - listener for balance auto update
    - write back to cache with throttle
  */
  useEffect(() => {
    (async () => {
      // eslint-disable-next-line react/prop-types
      const info = await _wallet.chainProvider.getAccountInfo({ address });
      setAccountInfo(info);
    })();
    const listenerId = _wallet.chainProvider.addAccountChangeListener(
      address,
      (info) => {
        // TODO update check which is fresh data (getAccountInfo/addAccountChangeListener)
        setAccountInfo(info);
        console.log('TokenBalance > balance updated!', info);
      },
    );
    console.log('TokenBalance > addAccountChangeListener', listenerId);
    return () => {
      console.log('TokenBalance > removeAccountChangeListener', listenerId);
      _wallet.chainProvider.removeAccountChangeListener(listenerId);
    };
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
