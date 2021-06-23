import React, { useEffect, useState } from 'react';
import { Observer } from 'mobx-react-lite';
import storeWallet from '../store/storeWallet';
import storeBalance from '../store/storeBalance';
import AmountText from './AmountText';

// eslint-disable-next-line react/prop-types
export default function TokenBalance({ wallet, address, tokenKey }) {
  const cacheBalanceInfo = storeBalance.getBalanceInfoByKey(tokenKey);
  const [balance, setBalance] = useState(cacheBalanceInfo.balance);
  const [decimals, setDecimals] = useState(cacheBalanceInfo.decimals);
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
      setBalance(info.balance);
      setDecimals(info.decimals);
      storeBalance.updateTokenBalance(tokenKey, {
        balance: info.balance,
        decimals: info.decimals,
      });
    })();
    const listenerId = _wallet.chainProvider.addAccountChangeListener(
      address,
      (info) => {
        // TODO update check which is fresh data (getAccountInfo/addAccountChangeListener)
        // only update balance, decimals is undefined in wss data
        setBalance(info.balance);
        console.log('TokenBalance > balance updated!', info);
        storeBalance.updateTokenBalance(tokenKey, {
          balance: info.balance,
        });
      },
    );
    console.log('TokenBalance > addAccountChangeListener', listenerId);
    return () => {
      console.log('TokenBalance > removeAccountChangeListener', listenerId);
      _wallet.chainProvider.removeAccountChangeListener(listenerId);
    };
  }, [address, _wallet]);

  return <AmountText value={balance} decimals={decimals} />;
}
