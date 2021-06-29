import React from 'react';
import { Observer } from 'mobx-react-lite';
import storeChain from '../../store/storeChain';
import { CONSTS_ACCOUNT_TYPES } from '../../consts/consts';
import utilsApp from '../../utils/utilsApp';
import storeAccount from '../../store/storeAccount';
import TokenBalance from '../TokenBalance';
import OneTokenInfo from '../../classes/OneTokenInfo';

// eslint-disable-next-line react/prop-types
export default function AccountCard({
  wallet,
  account,
  showBalance = false,
  watchBalanceChange = false,
  ...others
}) {
  if (!account || !account.address) {
    return null;
  }
  return (
    <Observer>
      {() => {
        const chainInfo = storeChain.getChainInfoByKey(account.chainKey);
        const isActive =
          storeAccount.currentAccount &&
          storeAccount.currentAccount.chainKey === account.chainKey &&
          storeAccount.currentAccount.address === account.address;
        const tokenInfo = new OneTokenInfo({
          isNative: true,
          address: account.address,
          chainKey: account.chainKey,
        });
        return (
          <div className="AccountCard" {...others}>
            <header className="AccountCard__header">
              {isActive && <span className="AccountCard__activeBadge" />}
              <span className="AccountCard__name">
                {account.name || 'ACCOUNT_NAME'}
                <span className="AccountCard__chainName">
                  {chainInfo?.name}
                </span>
              </span>
              <span className="AccountCard__typeTag">{account.type}</span>
            </header>
            <div className="AccountCard__address">
              {utilsApp.shortenAddress(account.address)}{' '}
              <strong onClick={() => console.log(account.address)}>
                [COPY]
              </strong>
            </div>
            <small className="AccountCard__path">{account.path}</small>
            <div className="AccountCard__blank" />
            {showBalance && (
              <footer>
                <div className="AccountCard__balance">
                  {/* TODO get balance in cache if at wallet select page */}
                  <TokenBalance
                    wallet={wallet}
                    tokenInfo={tokenInfo}
                    showUnit
                    watchBalanceChange={watchBalanceChange}
                  />{' '}
                  &gt;
                </div>
                <div className="AccountCard__balanceFiat">balance fiat</div>
              </footer>
            )}
          </div>
        );
      }}
    </Observer>
  );
}
