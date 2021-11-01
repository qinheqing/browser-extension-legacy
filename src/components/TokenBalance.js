import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import cx from 'classnames';
import storeWallet from '../store/storeWallet';
import storeBalance from '../store/storeBalance';
import storeToken from '../store/storeToken';
import AmountText from './AmountText';
import TokenAmountInPrice from './TokenAmountInPrice';
import SensitiveDataMask from './SensitiveDataMask';

// eslint-disable-next-line react/prop-types
function TokenBalance({
  className,
  classNamePrice,
  classNameUnit,
  wallet,
  tokenInfo, // { key, address, name },
  maskAssetBalance = false,
  showUnit = false,
  showPrice = false,
  priceEqualSign = '≈',
  watchBalanceChange = false, // addAccountChangeListener by websocket
  updateBalanceThrottle = 3 * 1000, // do not update balance in 3s
}) {
  // eslint-disable-next-line no-param-reassign
  tokenInfo = tokenInfo || storeToken.currentNativeToken;
  const { address, symbol, symbolDisplay } = tokenInfo;
  const cacheBalanceInfo = storeBalance.getTokenBalanceInfoInCache(tokenInfo);
  const { balance } = cacheBalanceInfo;
  const decimals = tokenInfo.decimals || cacheBalanceInfo.decimals;
  const _wallet = wallet || storeWallet.currentWallet;
  const currency = symbol || symbolDisplay;

  const shouldUpdateRecord = useMemo(() => {
    if (
      cacheBalanceInfo?.lastUpdate &&
      new Date().getTime() - cacheBalanceInfo?.lastUpdate <
        updateBalanceThrottle
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
        tokenInfo,
      });
      if (info) {
        storeBalance.updateTokenBalance(tokenInfo, {
          balance: info.balance,
          decimals: info.decimals,
        });
      }
    };
    const timerId = setTimeout(updateByRpc, 600);

    return () => {
      storeBalance.deletePendingBalanceFetchTask(address);
      clearTimeout(timerId);
    };
  }, [address]);

  useEffect(() => {
    if (!shouldUpdateRecord || !watchBalanceChange) {
      return () => null;
    }
    // start WSS WebSocket listening
    const listenerId = _wallet.chainManager.addAccountChangeListener(
      address,
      (info) => {
        // TODO update check which is fresh data (getAccountInfo/addAccountChangeListener)
        // only update balance, decimals is undefined in wss data
        console.log('TokenBalance > balance updated!', info);
        storeBalance.updateTokenBalance(tokenInfo, {
          balance: info.balance,
        });
      },
    );
    // console.log('TokenBalance > addAccountChangeListener', listenerId);
    return () => {
      // console.log('TokenBalance > removeAccountChangeListener', listenerId);
      _wallet.chainManager.removeAccountChangeListener(listenerId);
    };
  }, [address]);
  // console.log('token balance render:', { address, balance, decimals });
  return (
    <>
      <span className={className}>
        <SensitiveDataMask hide={maskAssetBalance}>
          <>
            <AmountText value={balance} decimals={decimals} />
            {showUnit && (
              <span className={cx('ml-1', classNameUnit)}>{currency}</span>
            )}
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
