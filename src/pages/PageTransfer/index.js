import React, { useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import AppFrame from '../../components/AppFrame';
import storeTransfer from '../../store/storeTransfer';
import TokenBalance from '../../components/TokenBalance';
import BackButton from '../../components/BackButton';
import storeWallet from '../../store/storeWallet';
import utilsToast from '../../utils/utilsToast';
import TxSubmitSuccessView from '../../components/TxSubmitSuccessView';

// const PageSample = observer(PageSamplePure);

function PageTransfer() {
  const [txid, setTxid] = useState('');
  const [contract, setContract] = useState(
    'GfiUpKtqoMzrmGUZygEvqHvs8dCKn2vkqgc8vUoFkEzr',
  );

  /*
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
   */
  return (
    <Observer>
      {() => {
        if (!storeTransfer.fromToken) {
          return <AppFrame>You need select a token to transfer</AppFrame>;
        }
        return (
          <AppFrame>
            <div className="u-padding-x">
              <div className="u-whitespace" />
              <div>
                <TokenBalance
                  watchBalanceChange
                  tokenInfo={storeTransfer.fromToken}
                  showUnit
                />
              </div>
              <div className="u-whitespace" />
              <div>
                <input
                  placeholder="Receipt address"
                  value={storeTransfer.toAddress}
                  onChange={(e) => (storeTransfer.toAddress = e.target.value)}
                />
              </div>
              <div className="u-whitespace" />
              <div>
                <input
                  placeholder="amount"
                  value={storeTransfer.amount}
                  onChange={(e) => (storeTransfer.amount = e.target.value)}
                />
              </div>
              <div className="u-whitespace" />
              <button
                onClick={async () => {
                  const id = await storeTransfer.doTransfer();
                  id && setTxid(id);
                }}
              >
                Send token
              </button>
              {txid && (
                <div>
                  DONE!
                  <button
                    onClick={() => {
                      window.open(
                        `https://explorer.solana.com/tx/${txid}?cluster=testnet`,
                      );
                    }}
                  >
                    Check tx on explorer
                  </button>
                  <div>{txid}</div>
                </div>
              )}
              <hr />
              <div>Fee: 0.0006 SOL</div>
              <div className="u-whitespace" />
              <input
                placeholder="Token mint address"
                value={contract}
                onChange={(e) => setContract(e.target.value)}
              />
              <br />
              <div className="u-whitespace" />
              <button
                onClick={async () => {
                  const address = contract;
                  if (address) {
                    const _txid =
                      await storeWallet.currentWallet.addAssociateToken({
                        contract: address,
                      });
                    utilsToast.toast(
                      <TxSubmitSuccessView txid={_txid}>
                        Add token success, reload page later
                      </TxSubmitSuccessView>,
                    );
                  }
                }}
              >
                + Add new token
              </button>
            </div>
          </AppFrame>
        );
      }}
    </Observer>
  );
}

PageTransfer.propTypes = {
  // children: PropTypes.any,
};

export default PageTransfer;
