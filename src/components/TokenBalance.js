import React, { useEffect, useMemo, useState } from 'react';
import { Observer } from 'mobx-react-lite';
import storeWallet from '../store/storeWallet';
import storeBalance from '../store/storeBalance';
import AmountText from './AmountText';

// eslint-disable-next-line react/prop-types
export default function TokenBalance({
  wallet,
  tokenInfo, // { key, address },
  showUnit = false,
  watchBalanceChange = false,
  updateBalanceThrottle = 0,
}) {
  const tokenKey = tokenInfo.key;
  const { address } = tokenInfo;
  const cacheBalanceInfo = storeBalance.getBalanceInfoByKey(tokenKey);
  const [balance, setBalance] = useState(cacheBalanceInfo.balance);
  const [decimals, setDecimals] = useState(cacheBalanceInfo.decimals);
  const _wallet = wallet || storeWallet.currentWallet;
  const { currency } = _wallet.chainInfo;

  const shouldUpdateRecord = useMemo(() => {
    if (
      cacheBalanceInfo?.lastUpdate &&
      cacheBalanceInfo?.lastUpdate >
        new Date().getTime() - updateBalanceThrottle
    ) {
      return false;
    }
    if (tokenInfo.chainKey !== _wallet.chainInfo.key) {
      return false;
    }
    return true;
  }, [cacheBalanceInfo, tokenInfo, updateBalanceThrottle]);

  /*
  TODO balance tracker:
    - read from cache
    - read from chain
    - listener for balance auto update
    - write back to cache with throttle
  */
  useEffect(() => {
    if (!shouldUpdateRecord) {
      return () => null;
    }
    const updateByRpc = async () => {
      // eslint-disable-next-line react/prop-types
      const info = await _wallet.chainProvider.getAccountInfo({ address });
      setBalance(info.balance);
      setDecimals(info.decimals);
      storeBalance.updateTokenBalance(tokenKey, {
        balance: info.balance,
        decimals: info.decimals,
      });
    };
    const timerId = setTimeout(updateByRpc, 600);

    return () => {
      clearTimeout(timerId);
    };
  }, [address]);

  useEffect(() => {
    if (!shouldUpdateRecord || !watchBalanceChange) {
      return () => null;
    }

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
  }, [address]);

  return (
    <>
      <AmountText value={balance} decimals={decimals} />
      {showUnit && <span>&nbsp;{currency}</span>}
    </>
  );
}
