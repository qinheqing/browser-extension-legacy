import React from 'react';
import { Observer } from 'mobx-react-lite';
import storeChain from '../../store/storeChain';
import { CONSTS_ACCOUNT_TYPES } from '../../consts/consts';
import utilsApp from '../../utils/utilsApp';
import storeAccount from '../../store/storeAccount';

// eslint-disable-next-line react/prop-types
export default function AccountCard({ account, ...others }) {
  if (!account || !account.address) {
    return null;
  }
  return (
    <Observer>
      {() => {
        const chainInfo = storeChain.getChainInfoByKey(account.chainKey);
        const isActive =
          storeAccount.currentAccount.chainKey === account.chainKey &&
          storeAccount.currentAccount.address === account.address;
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
              {account.type === CONSTS_ACCOUNT_TYPES.Hardware && (
                <span className="AccountCard__typeTag">Hardware</span>
              )}
            </header>
            <div className="AccountCard__address">
              {utilsApp.shortenAddress(account.address)} [COPY]
            </div>
            <div className="AccountCard__blank" />
            <footer>
              <div className="AccountCard__balance">Balance &gt;</div>
              <div className="AccountCard__balanceFiat">balance fiat</div>
            </footer>
          </div>
        );
      }}
    </Observer>
  );
}
