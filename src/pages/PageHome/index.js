import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Observer } from 'mobx-react-lite';
import AppFrame from '../../components/AppFrame';
import storeAccount from '../../store/storeAccount';
import TokenBalance from '../../components/TokenBalance';
import AccountCard from '../../components/AccountCard';
import {
  ROUTE_HOME,
  ROUTE_HOME_OLD,
  ROUTE_WALLET_SELECT,
} from '../../routes/routeUrls';
import storeWallet from '../../store/storeWallet';
import storeToken from '../../store/storeToken';
import TokenInfoCard from '../../components/TokenInfoCard';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';

export default function PageHome() {
  const history = useHistory();
  const [copied, handleCopy] = useCopyToClipboard();

  useEffect(() => {
    storeWallet.getCurrentAccountTokens();
  }, []);

  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <button onClick={() => history.push(ROUTE_WALLET_SELECT)}>
              Select account &gt;
            </button>
            <button onClick={() => history.push(ROUTE_HOME_OLD)}>
              Old Home
            </button>
            {!storeAccount.currentAccount && (
              <div>Please select or create account</div>
            )}
            {storeAccount.currentAccount && (
              <>
                <AccountCard
                  account={storeAccount.currentAccount}
                  showBalance
                  watchBalanceChange
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
                      handleCopy(storeAccount.currentAccount.address);
                      utilsToast.toast(
                        <div>
                          <div>Copied address</div>
                          <strong style={{ fontWeight: 'bold' }}>
                            {storeAccount.currentAccount.address}
                          </strong>
                        </div>,
                      );
                      console.log(storeAccount.currentAccount.address);
                    }}
                  >
                    Deposit
                  </button>{' '}
                  <button
                    onClick={() => {
                      console.log('Notice button click');
                      global.testGlobalError.testGlobalErrorField = 1;
                    }}
                  >
                    Notice
                  </button>
                </div>
                <hr />
                <div>
                  <div className="u-padding-x">
                    <button
                      onClick={() => {
                        const address = global.prompt(
                          'Token mint address',
                          'H8SThNDAVecEutTHQr7EMwScfsTkTPrQmYaDGfcnhG7Y',
                        );
                        if (address) {
                          storeWallet.currentWallet.addAssociateToken({
                            contract: address,
                          });
                        }
                      }}
                    >
                      + Add Token
                    </button>
                  </div>
                  <div>
                    {storeToken.currentTokens.map((token) => {
                      return (
                        <TokenInfoCard
                          key={token.contractAddress}
                          token={token}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </AppFrame>
        );
      }}
    </Observer>
  );
}
