import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import URI from 'urijs';
import bs58 from 'bs58';
import { Message } from 'vendors/solanaWeb3';
import AppPageLayout from '../../components/AppPageLayout';
import { CONST_DAPP_MESSAGE_TYPES } from '../../consts/consts';
import storeAccount from '../../store/storeAccount';
import { ROUTE_WALLET_SELECT } from '../../routes/routeUrls';
import ReactJsonView from '../../components/ReactJsonView';
import OneDappMessage from '../../classes/OneDappMessage';
import storeWallet from '../../store/storeWallet';
import TokenBalance from '../../components/TokenBalance';
import storeToken from '../../store/storeToken';
import OneButton from '../../components/OneButton';
import AppIcons from '../../components/AppIcons';
import OneDetailItem from '../../components/OneDetailItem';
import storeTransfer from '../../store/storeTransfer';
import utilsUrl from '../../utils/utilsUrl';

function ApproveDappSiteInfo({ query, title, showAccountInfo = false }) {
  const account = storeAccount.currentAccount;
  const connectAccountInfo = account && (
    <>
      <AppIcons.SwitchVerticalIcon className="w-10 my-4 text-green-one-500" />
      {account && (
        <>
          <div className="font-bold">{account.name}</div>
          <div className="text-center break-all text-sm text-gray-500 leading-none">
            {storeAccount.currentAccountAddressShort}
          </div>
        </>
      )}
      {!account && (
        <div>
          <div>请先选择一个账户进行操作</div>
          <OneButton onClick={() => history.push(ROUTE_WALLET_SELECT)}>
            选择账户
          </OneButton>
        </div>
      )}
    </>
  );
  return (
    <div className="flex flex-col items-center py-6 px-4">
      <AppIcons.GlobeAltIcon className="w-12 text-gray-400" />
      <h1 className="text-2xl mt-2 mb-1">{title}</h1>
      <div className="text-sm text-gray-500">{query.origin}</div>
      {showAccountInfo && connectAccountInfo}
    </div>
  );
}

function ApprovePageLayout({ title, actions, ...others }) {
  return (
    <AppPageLayout
      whiteBg
      navLeft={null}
      title={title}
      footer={
        <div className="bg-white px-4 py-2 flex items-center">{actions}</div>
      }
      {...others}
    />
  );
}

const CurrentBalanceView = observer(function () {
  if (!storeAccount.currentAccountAddress) {
    return null;
  }
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

const ApproveConnection = observer(function ({ onApprove, query }) {
  const account = storeAccount.currentAccount;
  return (
    <ApprovePageLayout
      title="连接账户"
      actions={
        <>
          {account && (
            <>
              <OneButton block type="white" onClick={() => window.close()}>
                取消
              </OneButton>
              <div className="w-4" />
              <OneButton block type="primary" onClick={() => onApprove(false)}>
                连接
              </OneButton>
            </>
          )}
        </>
      }
    >
      <div className="pt-8">
        <ApproveDappSiteInfo
          title="是否允许该网站连接"
          query={query}
          showAccountInfo
        />
      </div>
      {/* <ReactJsonView collapsed={false} src={query} />*/}
    </ApprovePageLayout>
  );
});

async function decodeTx(txStr) {
  const txDecoded = await storeWallet.currentWallet.decodeTransactionData({
    address: storeAccount.currentAccountAddress,
    data: txStr,
  });
  console.log('txDecoded', txDecoded);
  return txDecoded;
}

function TransactionItemView({ txStr }) {
  if (!txStr) {
    return null;
  }
  const tx = Message.from(bs58.decode(txStr));
  const accountKeys = tx?.accountKeys || [];
  return (
    <>
      {accountKeys.map((k, index) => (
        <OneDetailItem
          alignY
          title="交易账户"
          key={index}
          content={<div className="break-all">{k.toString()}</div>}
        />
      ))}
    </>
  );
}

const ApproveTransaction = observer(function ({ onReject, onApprove, query }) {
  const txStr = query?.request?.params?.message;
  const [txDecoded, setTxDecoded] = useState({});
  useEffect(() => {
    if (txStr) {
      decodeTx(txStr).then((tx) => setTxDecoded(tx));
    }
  }, [txStr]);
  useEffect(() => {
    storeTransfer.fetchTransactionFee();
  }, []);
  const account = storeAccount.currentAccount;
  if (!account) {
    return <div>Current wallet account not found</div>;
  }
  return (
    <ApprovePageLayout
      title="授权交易"
      actions={
        <>
          {/* TODO window close trigger onReject()*/}
          <OneButton block type="white" onClick={() => onReject()}>
            拒绝
          </OneButton>
          <div className="w-4" />
          <OneButton block type="primary" onClick={() => onApprove(false)}>
            确认授权
          </OneButton>
        </>
      }
    >
      <div className="">
        <ApproveDappSiteInfo title="是否授权该网站的交易请求" query={query} />
        <ReactJsonView src={txDecoded} />
        <div className="divide-y px-4">
          <OneDetailItem title="手续费">
            {storeTransfer.fee} {storeTransfer.feeSymbol}
          </OneDetailItem>
          <TransactionItemView txStr={txStr} />
          <OneDetailItem alignY title="交易原始数据">
            <div className="break-all">{txStr}</div>
          </OneDetailItem>
        </div>
      </div>
    </ApprovePageLayout>
  );
});

function PageApprovePopup() {
  const query = useMemo(() => {
    // check background.js > launchPopup()
    // "chrome-extension://lmabaafdmodflajjjldinacmfaacegkl/popup.html#app/popup/?origin=xx&network=xx&request=xx"

    /*
        network: "https://testnet.solana.com"
        origin: "https://0o0up.csb.app"
        request: '{"jsonrpc":"2.0","id":2,"method":"connect","params":{"network":"https://testnet.solana.com"}}'
     */
    const { network, origin, request } = utilsUrl.getQuery({
      url: window.location.hash.slice(1),
    });
    return {
      network, // chain network
      origin, // dapp origin
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

  // TODO signAllTransactions
  if (request.method === 'signTransaction') {
    // debugger;

    // async function onApprove()
    const onApprove = async () => {
      // TODO read [query.request.params.message] directly
      const txMessage = messages[0];

      // TODO check connectedWallets of this origin is matched with current selected Account

      const signature = await storeWallet.currentWallet.signTx(txMessage);

      // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L187
      // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L49

      postMessageToBg(
        OneDappMessage.signedMessage({
          id: request.id,
          result: {
            signature,
            publicKey: storeAccount.currentAccountAddress,
          },
        }),
      );

      popRequest();
    };

    const onReject = () => {
      popRequest();
      postMessageToBg(
        OneDappMessage.errorMessage({
          id: request.id,
          error: 'Transaction cancelled',
        }),
      );
    };

    return (
      <ApproveTransaction
        query={query}
        onApprove={onApprove}
        onReject={onReject}
      />
    );
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
    <AppPageLayout>
      <ReactJsonView collapsed={false} src={query} />
    </AppPageLayout>
  );
}

PageApprovePopup.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageApprovePopup);
