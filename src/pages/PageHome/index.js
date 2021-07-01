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
  ROUTE_TRANSFER,
  ROUTE_WALLET_SELECT,
} from '../../routes/routeUrls';
import storeWallet from '../../store/storeWallet';
import storeToken from '../../store/storeToken';
import TokenInfoCard from '../../components/TokenInfoCard';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import utilsApp from '../../utils/utilsApp';
import storeTransfer from '../../store/storeTransfer';
import storeApp from '../../store/storeApp';
import TxSubmitSuccessView from '../../components/TxSubmitSuccessView';

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
          <AppFrame showBack={false}>
            <button onClick={() => history.push(ROUTE_WALLET_SELECT)}>
              Select account &gt;
            </button>
            <button
              onClick={() => {
                storeApp.homeType = 'OLD';
                history.push(ROUTE_HOME_OLD);
              }}
            >
              Old Home
            </button>
            <button onClick={() => utilsApp.openStandalonePage(ROUTE_HOME)}>
              Expand to full page
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
                      storeTransfer.fromToken = storeToken.currentNativeToken;
                      history.push(ROUTE_TRANSFER);
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
                      onClick={async () => {
                        storeTransfer.fromToken = storeToken.currentNativeToken;
                        history.push(ROUTE_TRANSFER);
                      }}
                    >
                      + Add Token
                    </button>
                    <button
                      onClick={() =>
                        storeWallet.currentWallet
                          .requestAirdrop()
                          .then((txid) => {
                            utilsToast.toast.success(
                              <TxSubmitSuccessView txid={txid}>
                                Done! Airdrop request submitted
                              </TxSubmitSuccessView>,
                            );
                          })
                      }
                    >
                      Request airdrop
                    </button>
                    <button
                      onClick={() => storeWallet.getCurrentAccountTokens()}
                    >
                      Refresh
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
