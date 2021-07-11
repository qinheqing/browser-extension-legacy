import React, { useEffect, useMemo, useState } from 'react';
import { Observer } from 'mobx-react-lite';
import storeWallet from '../store/storeWallet';
import storeBalance from '../store/storeBalance';
import AmountText from './AmountText';

// eslint-disable-next-line react/prop-types
export default function TokenBalance({
  className,
  wallet,
  tokenInfo, // { key, address, name },
  showUnit = false,
  watchBalanceChange = false,
  updateBalanceThrottle = 3 * 1000,
}) {
  const tokenKey = tokenInfo.key;
  const { address, symbol, symbolDisplay } = tokenInfo;
  const cacheBalanceInfo = storeBalance.getBalanceInfoCacheByKey(tokenKey);
  const [balance, setBalance] = useState(cacheBalanceInfo.balance);
  const [decimals, setDecimals] = useState(cacheBalanceInfo.decimals);
  const _wallet = wallet || storeWallet.currentWallet;
  const currency = symbol || symbolDisplay;

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
      const info = await storeBalance.fetchBalanceInfo({
        wallet: _wallet,
        address,
        tokenKey,
      });
      if (info) {
        setBalance(info.balance);
        setDecimals(info.decimals);
        storeBalance.updateTokenBalance(tokenKey, {
          balance: info.balance,
          decimals: info.decimals,
        });
      }
    };
    const timerId = setTimeout(updateByRpc, 600);

    return () => {
      delete storeBalance.fetchBalancePendingQueue[address];
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
    <span className={className}>
      <AmountText value={balance} decimals={decimals} />
      {showUnit && <span className="ml-1">{currency}</span>}
    </span>
  );
}
