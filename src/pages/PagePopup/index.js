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
import connectMockSOL from '../../utils/connectMockSOL';
import OneDappMessage from '../../classes/OneDappMessage';

const { Transaction, PublicKey } = global.solanaWeb3;

// const PageSample = observer(PageSamplePure);

function ApproveConnection({ onApprove }) {
  const history = useHistory();
  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <div className="u-wrap-text">
              {storeAccount.currentAccountAddress}
              <button onClick={() => history.push(ROUTE_WALLET_SELECT)}>
                change
              </button>
            </div>
            <div className="u-whitespace" />
            <div>
              <button>Cancel</button>
              <button onClick={() => onApprove(false)}>Connect</button>
            </div>
          </AppFrame>
        );
      }}
    </Observer>
  );
}

function ApproveTransaction({ onApprove }) {
  return (
    <AppFrame>
      <button onClick={() => onApprove(false)}>Approve tx</button>
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

  useEffect(() => {
    function messageHandler(e) {
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
          messages: [bs58.decode(request.params.message)],
          messageDisplay: 'tx',
        };
      case 'signAllTransactions':
        return {
          messages: request.params.messages.map((m) => bs58.decode(m)),
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
    // window.close();
  }

  if (request.method === 'signTransaction') {
    // debugger;

    // async function onApprove()
    const onApprove = async () => {
      const txMessage = messages[0];

      // * ledger
      // var num_paths = Buffer.alloc(1);
      // num_paths.writeUInt8(1);
      // const payload = Buffer.concat([num_paths, derivation_path, msg_bytes]);

      const signature = await connectMockSOL.signTxMessageInHardware(
        txMessage,
        storeAccount.currentAccount.path,
      );

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

    return <ApproveTransaction onApprove={onApprove} />;
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

    return <ApproveConnection origin={query.origin} onApprove={connect} />;
  }

  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <ReactJsonView collapsed src={query} />
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
