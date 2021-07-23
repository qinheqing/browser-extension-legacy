import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import storeWallet from '../store/storeWallet';
import storeBalance from '../store/storeBalance';
import AmountText from './AmountText';
import TokenAmountInPrice from './TokenAmountInPrice';
import SensitiveDataMask from './SensitiveDataMask';

// eslint-disable-next-line react/prop-types
function TokenBalance({
  className,
  classNamePrice,
  wallet,
  tokenInfo, // { key, address, name },
  maskAssetBalance = false,
  showUnit = false,
  watchBalanceChange = false,
  showPrice = false,
  priceEqualSign = '≈',
  updateBalanceThrottle = 3 * 1000,
}) {
  const tokenKey = tokenInfo.key;
  const { address, symbol, symbolDisplay } = tokenInfo;
  const cacheBalanceInfo = storeBalance.getTokenBalanceInfoCacheByKey(tokenKey);
  const { balance } = cacheBalanceInfo;
  const decimals = tokenInfo.decimals || cacheBalanceInfo.decimals;
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
    // start WSS WebSocket listening
    const listenerId = _wallet.chainProvider.addAccountChangeListener(
      address,
      (info) => {
        // TODO update check which is fresh data (getAccountInfo/addAccountChangeListener)
        // only update balance, decimals is undefined in wss data
        console.log('TokenBalance > balance updated!', info);
        storeBalance.updateTokenBalance(tokenKey, {
          balance: info.balance,
        });
      },
    );
    // console.log('TokenBalance > addAccountChangeListener', listenerId);
    return () => {
      // console.log('TokenBalance > removeAccountChangeListener', listenerId);
      _wallet.chainProvider.removeAccountChangeListener(listenerId);
    };
  }, [address]);
  return (
    <>
      <span className={className}>
        <SensitiveDataMask hide={maskAssetBalance}>
          <>
            <AmountText value={balance} decimals={decimals} />
            {showUnit && <span className="ml-1">{currency}</span>}
          </>
        </SensitiveDataMask>
      </span>
      {showPrice && (
        <div className={classNamePrice}>
          <SensitiveDataMask hide={maskAssetBalance}>
            {priceEqualSign}&nbsp;
            <TokenAmountInPrice token={tokenInfo} value={balance} />
          </SensitiveDataMask>
        </div>
      )}
    </>
  );
}

export default observer(TokenBalance);
