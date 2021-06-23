import React from 'react';
import { useHistory } from 'react-router-dom';
import { Observer } from 'mobx-react-lite';
import AppFrame from '../../components/AppFrame';
import storeChain from '../../store/storeChain';
import storeAccount from '../../store/storeAccount';
import TokenBalance from '../../components/TokenBalance';
import AccountCard from '../../components/AccountCard';
import { ROUTE_WALLET_SELECT } from '../../routes/routeUrls';

export default function PageHome() {
  const history = useHistory();

  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <button onClick={() => history.push(ROUTE_WALLET_SELECT)}>
              Select account &gt;
            </button>
            <div>CHAIN: {storeChain.currentChainInfo?.name}</div>
            <AccountCard account={storeAccount.currentAccount} />
            <div>
              <button>Transfer</button> <button>Deposit</button>{' '}
              <button>Notice</button>
            </div>
            <div>
              <div>
                Balance:
                <TokenBalance
                  address={storeAccount.currentAccount.address}
                />{' '}
                {storeChain.currentChainInfo?.currency}
              </div>
            </div>
          </AppFrame>
        );
      }}
    </Observer>
  );
}
