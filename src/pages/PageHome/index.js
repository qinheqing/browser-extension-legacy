import React from 'react';
import { useHistory } from 'react-router-dom';
import { Observer } from 'mobx-react-lite';
import AppFrame from '../../components/AppFrame';
import storeAccount from '../../store/storeAccount';
import TokenBalance from '../../components/TokenBalance';
import AccountCard from '../../components/AccountCard';
import { ROUTE_WALLET_SELECT } from '../../routes/routeUrls';
import storeWallet from '../../store/storeWallet';

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
            {!storeAccount.currentAccount && (
              <div>Please select or create account</div>
            )}
            {storeAccount.currentAccount && (
              <>
                <AccountCard
                  account={storeAccount.currentAccount}
                  showBalance
                />
                <div className="u-flex-center">
                  <button
                    onClick={() => {
                      if (
                        global.confirm(
                          'confirm to transfer? see log in the console',
                        )
                      ) {
                        storeWallet.currentWallet.transfer({
                          amount: '0.007',
                          to: '6NuMY8tuAEbaysLbf2DX2Atuw24a5dpFvBJUu9Tundek',
                        });
                      }
                    }}
                  >
                    Transfer
                  </button>{' '}
                  <button
                    onClick={() => {
                      global.alert('View address in the console');
                      console.log(storeAccount.currentAccount.address);
                    }}
                  >
                    Deposit
                  </button>{' '}
                  <button>Notice</button>
                </div>
                <div>
                  <div>
                    Balance:
                    <TokenBalance
                      address={storeAccount.currentAccount.address}
                    />{' '}
                    {storeAccount.currentAccount.currency}
                  </div>
                  <button
                    onClick={async () => {
                      // TODO get balance decimals; balance update listener; add custom token;
                      const res =
                        await storeWallet.currentWallet.chainProvider.getAccountTokens();
                      console.log('Get Token List getAccountTokens', res);
                    }}
                  >
                    Get Token List
                  </button>
                </div>
              </>
            )}
          </AppFrame>
        );
      }}
    </Observer>
  );
}
