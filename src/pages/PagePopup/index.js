import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import URI from 'urijs';
import bs58 from 'bs58';
import { useHistory } from 'react-router-dom';
import AppFrame from '../../components/AppFrame';
import { CONST_DAPP_MESSAGE_TYPES } from '../../consts/consts';
import storeAccount from '../../store/storeAccount';
import { ROUTE_WALLET_SELECT } from '../../routes/routeUrls';
import ReactJsonView from '../../components/ReactJsonView';
import OneDappMessage from '../../classes/OneDappMessage';
import storeWallet from '../../store/storeWallet';
import TokenBalance from '../../components/TokenBalance';
import storeToken from '../../store/storeToken';

const { Transaction, PublicKey } = global.solanaWeb3;

// const PageSample = observer(PageSamplePure);

const CurrentBalanceView = observer(function () {
  return (
    <div>
      Address:
      <div>{storeAccount.currentAccountAddress}</div>
      <hr />
      Current balance:
      <div>
        <TokenBalance
          watchBalanceChange
          showUnit
          tokenInfo={storeToken.currentNativeToken}
        />
      </div>
    </div>
  );
});

function ApproveConnection({ onApprove, query }) {
  const history = useHistory();
  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <div className="u-padding-x">
              <div className="u-wrap-text">
                {storeAccount.currentAccountAddress ||
                  'You should select a account first'}
                <button onClick={() => history.push(ROUTE_WALLET_SELECT)}>
                  Change account
                </button>
                <CurrentBalanceView />
              </div>
              <div className="u-whitespace" />
              <hr />
              {storeAccount.currentAccountAddress && (
                <div className="u-flex-center">
                  <button>Cancel</button>
                  <button onClick={() => onApprove(false)}>Connect</button>
                </div>
              )}
            </div>
            <hr />
            <ReactJsonView collapsed={false} src={query} />
          </AppFrame>
        );
      }}
    </Observer>
  );
}

function ApproveTransaction({ onApprove, query }) {
  return (
    <AppFrame>
      <div className="u-padding-x">
        <CurrentBalanceView />
        <div className="u-flex-center">
          <button>Cancel</button>
          <button onClick={() => onApprove(false)}>Approve</button>
        </div>

        <hr />
        <ReactJsonView collapsed={false} src={query} />
      </div>
    </AppFrame>
  );
}

function PagePopup() {
  const query = useMemo(() => {
    // check background.js > launchPopup()
    // "chrome-extension://lmabaafdmodflajjjldinacmfaacegkl/popup.html#app/popup/?origin=xx&network=xx&request=xx"
    const uri = new URI(window.location.hash.slice(1));

    /*
        network: "https://testnet.solana.com"
        origin: "https://0o0up.csb.app"
        request: '{"jsonrpc":"2.0","id":2,"method":"connect","params":{"network":"https://testnet.solana.com"}}'
     */
    const { network, origin, request } = uri.query(true);
    return {
      network,
      origin,
      request: JSON.parse(request),
    };
  }, [window.location.hash]);

  // dapp rpc requests queue
  const [requestsQueue, setRequestsQueue] = useState([query.request]);

  // message from popup -> bg -> content -> inpage -> dapp
  const postMessageToBg = useCallback(
    (message) => {
      global.chrome.runtime.sendMessage(
        OneDappMessage.extensionRuntimeMessage({
          channel: CONST_DAPP_MESSAGE_TYPES.CHANNEL_POPUP_TO_BG,
          data: message,
        }),
      );
    },
    [query.origin],
  );

  // Push requests from the parent window (opener) postMessage into a queue.
  //    TODO requestsQueue may only works at sollet Web Wallet
  useEffect(() => {
    function messageHandler(e) {
      // check event origin, source, target for safety
      if (e.origin === query.origin && e.source === window.opener) {
        if (
          e.data.method !== 'signTransaction' &&
          e.data.method !== 'signAllTransactions' &&
          e.data.method !== 'sign'
        ) {
          postMessageToBg(
            OneDappMessage.errorMessage({
              id: e.data.id,
              error: 'Unsupported method',
            }),
          );
        }

        setRequestsQueue((requests) => [...requests, e.data]);
      }
    }
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [query.origin, postMessageToBg]);

  const request = requestsQueue[0];
  const popRequest = () => setRequestsQueue((requests) => requests.slice(1));

  const { messages, messageDisplay } = useMemo(() => {
    if (!request || request.method === 'connect') {
      return { messages: [], messageDisplay: 'tx' };
    }
    switch (request.method) {
      case 'signTransaction':
        return {
          messages: [request.params.message],
          messageDisplay: 'tx',
        };
      case 'signAllTransactions':
        return {
          messages: request.params.messages.map((m) => m),
          messageDisplay: 'tx',
        };
      case 'sign':
        if (!(request.params.data instanceof Uint8Array)) {
          throw new Error('Data must be an instance of Uint8Array');
        }
        return {
          messages: [request.params.data],
          messageDisplay: request.params.display === 'utf8' ? 'utf8' : 'hex',
        };
      default:
        throw new Error(`Unexpected method > ${request.method}`);
    }
  }, [request]);

  if (!request) {
    window.close();
    return null;
  }

  if (request.method === 'signTransaction') {
    // debugger;

    // async function onApprove()
    const onApprove = async () => {
      const txMessage = messages[0];

      // TODO check connectedWallets of this origin is matched with current selected Account

      const signature = await storeWallet.currentWallet.signTx(txMessage);

      // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L187
      // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L49

      postMessageToBg(
        OneDappMessage.signedMessage({
          result: {
            signature,
            publicKey: storeAccount.currentAccountAddress,
          },
          id: request.id,
        }),
      );

      popRequest();
    };

    return <ApproveTransaction query={query} onApprove={onApprove} />;
  }

  if (request.method === 'connect') {
    // Approve the parent page to connect to this wallet.
    const connect = (autoApprove) => {
      // * setConnectedAccount(wallet.publicKey);
      // * save to storage
      global.chrome.storage.local.get('connectedWallets', (result) => {
        const connectedWallets = {
          ...result?.connectedWallets,
          [query.origin]: {
            publicKey: storeAccount.currentAccountAddress,
            autoApprove,
          },
        };
        global.chrome.storage.local.set({
          connectedWallets,
          lastUpdateStorageTime: `${new Date().toString()} > PagePopup.js`,
        });
        global.chrome.storage.local.get('connectedWallets', console.log);
      });

      // * send publicKey to inpage provider
      postMessageToBg(
        OneDappMessage.connectedMessage({
          id: request.id,
          params: {
            publicKey: storeAccount.currentAccountAddress,
            autoApprove,
          },
        }),
      );
      popRequest();
    };

    return (
      <ApproveConnection
        origin={query.origin}
        query={query}
        onApprove={connect}
      />
    );
  }

  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <ReactJsonView collapsed={false} src={query} />
          </AppFrame>
        );
      }}
    </Observer>
  );
}

PagePopup.propTypes = {
  // children: PropTypes.any,
};

export default PagePopup;
