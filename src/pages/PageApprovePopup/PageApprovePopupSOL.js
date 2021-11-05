import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import URI from 'urijs';
import bs58 from 'bs58';
import { Message, PublicKey } from '@solana/web3.js';
import { isString, isNumber, isDate } from 'lodash';
import BN from 'bn.js';
import { useParams, useLocation } from 'react-router-dom';
import extension from 'extensionizer';
import AppPageLayout from '../../components/AppPageLayout';
import {
  BACKGROUND_PROXY_MODULE_NAMES,
  CONST_CHAIN_KEYS,
  CONST_DAPP_MESSAGE_TYPES,
  CONST_SOL,
} from '../../consts/consts';
import storeAccount from '../../store/storeAccount';
import { ROUTE_WALLET_SELECT } from '../../routes/routeUrls';
import ReactJsonView from '../../components/ReactJsonView';
import DappMessageSOL from '../../wallets/providers/SOL/dapp/DappMessageSOL';
import storeWallet from '../../store/storeWallet';
import TokenBalance from '../../components/TokenBalance';
import storeToken from '../../store/storeToken';
import OneButton from '../../components/OneButton';
import AppIcons from '../../components/AppIcons';
import OneDetailItem from '../../components/OneDetailItem';
import storeTransfer from '../../store/storeTransfer';
import utilsUrl from '../../utils/utilsUrl';
import utilsApp from '../../utils/utilsApp';
import OneCellItem from '../../components/OneCellItem';
import OneArrow from '../../components/OneArrow';
import { ChainLogoIcon } from '../../components/LogoIcon';
import CopyHandle from '../../components/CopyHandle';
import storeChain from '../../store/storeChain';
import storeApp from '../../store/storeApp';
import { CONST_DAPP_METHODS_SOL } from '../../wallets/providers/SOL/dapp/consts';
import uiBackgroundProxy from '../../wallets/bg/uiBackgroundProxy';
import { OneDetailItemGroup } from '../../components/OneDetailItemGroup';
import { OneField } from '../../components/OneField/OneField';
import ApprovePageLayout from './ApprovePageLayout';
import ApproveDappSiteInfo from './ApproveDappSiteInfo';
import ApproveConnection from './ApproveConnection';

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

function toHex(buffer) {
  return Array.prototype.map
    .call(buffer, (x) => `00${x.toString(16)}`.slice(-2))
    .join('');
}

function decodeSignMessage({ data, display }) {
  let messageTxt;
  switch (display) {
    case 'utf8':
      messageTxt = new TextDecoder().decode(data);
      break;
    case 'hex':
      messageTxt = `0x${toHex(data)}`;
      break;
    default:
      throw new Error(`Unexpected message type: ${display}`);
  }
  return messageTxt;
}

const ApproveSign = observer(function ({ query, origin, onReject, onApprove }) {
  const account = storeAccount.currentAccountInfo;
  const signTextDisplay = decodeSignMessage(query.request.params);
  const signMessageEncode = bs58.encode(query.request.params.data);
  // TODO hex data sign warning
  //    Be especially cautious when signing arbitrary data, you must trust the requester.
  return (
    <ApprovePageLayout
      query={query}
      title="签名授权"
      actions={
        <>
          {/* TODO beforeunload window close trigger onReject() */}
          <OneButton block type="white" onClick={() => onReject()}>
            拒绝
          </OneButton>
          <div className="w-4" />
          <OneButton
            block
            type="primary"
            onClick={() =>
              onApprove({ autoApprove: false, message: signMessageEncode })
            }
          >
            {/* 签名授权 */}
            确认授权
          </OneButton>
        </>
      }
    >
      <div className="pt-8">
        <ApproveDappSiteInfo
          title="是否允许该网站的签名请求"
          query={query}
          showAccountInfo
        />
      </div>
      <div className="p-4 u-break-words text-center border rounded m-4 bg-gray-50">
        {signTextDisplay}
      </div>
    </ApprovePageLayout>
  );
});

async function decodeTxAsync(txStr) {
  const txDecoded = await storeWallet.currentWallet.decodeTransactionData({
    address: storeAccount.currentAccountAddress,
    data: txStr,
  });
  console.log('txDecoded', txDecoded);
  return txDecoded;
}

function TransactionAccountsListView({ txDecoded }) {
  const rawTx = txDecoded?.rawTx;
  if (!rawTx || !txDecoded) {
    return null;
  }
  const accountKeys = rawTx?.accountKeys || [];
  return (
    <>
      <OneDetailItem
        title="交易账户"
        content={
          <div className="break-all">
            {accountKeys.map((k, index) => (
              <div key={index}>{utilsApp.shortenAddress(k.toString())}</div>
            ))}
          </div>
        }
      />
    </>
  );
}

function InstructionDataValueViewSOL({ value }) {
  let content = value;

  if (content?.toBase58) {
    const address = content.toBase58();
    content = (
      <CopyHandle text={address}>{utilsApp.shortenAddress(address)}</CopyHandle>
    );
    return content;
  }

  return utilsApp.reactSafeRender(content) || '-';
}

function safeCapitalCase(str) {
  if (!isString(str)) {
    return '';
  }
  return utilsApp.changeCase.capitalCase(str);
}

function TxInstructionCardSOL({ instruction, onClick }) {
  if (!instruction) {
    return null;
  }
  const ixDataEntries = Object.entries(instruction?.data || {});
  return (
    <div className="bg-white border rounded mx-4 my-2">
      <div className="border-b px-2 py-1.5 font-bold flex items-center">
        <span>{safeCapitalCase(instruction?.type)}</span>
        <div className="flex-1" />
        {onClick && <OneArrow />}
      </div>
      <OneDetailItemGroup divide={false} className="px-2 py-2">
        {ixDataEntries.map(([k, v]) => {
          return (
            <OneDetailItem
              compact
              key={k}
              title={safeCapitalCase(k)}
              content={<InstructionDataValueViewSOL value={v} />}
            />
          );
        })}
      </OneDetailItemGroup>
    </div>
  );
}

function TransactionItemView({ txDecoded, index, showHeader = false }) {
  if (!txDecoded) {
    return null;
  }
  const instructions = txDecoded?.instructions || [];
  return (
    <div>
      {showHeader && <div className="px-5 text-xl pt-2">交易 {index + 1}</div>}
      {instructions.map((instruction, i) => (
        <TxInstructionCardSOL key={i} instruction={instruction} />
      ))}
    </div>
  );
}

const ApproveTransaction = observer(function ({
  onReject,
  onApprove,
  query,
  isBatch = false,
}) {
  // messages
  const messageToSign = isBatch
    ? query.request.params.messages
    : query.request.params.message;
  const txStrList = [].concat(messageToSign);
  const [txListDecoded, setTxListDecoded] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  useEffect(() => {
    Promise.all(txStrList.map(async (txStr) => decodeTxAsync(txStr))).then(
      (txs) => setTxListDecoded(txs),
    );
    global.$ok_decodeTxAsync = decodeTxAsync;
  }, [
    // DO NOT use txStrList, cause infinite render
    messageToSign,
  ]);

  useEffect(() => {
    (async () => {
      const feeInfo = await storeTransfer.fetchFeeInfo();
      storeTransfer.feeInfo = feeInfo;
    })();
  }, []);
  const account = storeAccount.currentAccountInfo;
  if (!account) {
    return <div>Current wallet account not found</div>;
  }
  return (
    <ApprovePageLayout
      query={query}
      whiteBg={false}
      title="交易授权"
      navRight={<ChainLogoIcon />}
      actions={
        <>
          {/* TODO beforeunload window close trigger onReject() */}
          <OneButton block type="white" onClick={() => onReject()}>
            拒绝
          </OneButton>
          <div className="w-4" />
          <OneButton
            loading={btnLoading}
            block
            type="primary"
            onClick={async () => {
              try {
                setBtnLoading(true);
                await onApprove({
                  autoApprove: false,
                  message: txStrList,
                  isBatch,
                });
              } finally {
                setBtnLoading(false);
              }
            }}
          >
            {/* 交易授权*/}
            确认授权
          </OneButton>
        </>
      }
    >
      <div className="">
        <ApproveDappSiteInfo title="是否授权该网站的交易请求" query={query} />

        {txListDecoded.map((txDecoded, index) => (
          <TransactionItemView
            key={index}
            showHeader={isBatch}
            index={index}
            txDecoded={txDecoded}
          />
        ))}

        <div
          className="bg-white divide-y px-4"
          onClick={() => console.log('txListDecoded', txListDecoded)}
        >
          <OneDetailItem title="授权账户">
            <div className="flex items-center">
              <ChainLogoIcon size="sm" className="mr-2" />
              {storeAccount.currentAccountAddressShort}
            </div>
          </OneDetailItem>
          <OneDetailItem title="手续费">
            {storeTransfer.fee} {storeTransfer.feeSymbol}
          </OneDetailItem>

          {/* <TransactionAccountsListView txDecoded={txDecoded} /> */}
          <OneDetailItem alignY title="原始数据">
            <div className="break-all divide-y w-full">
              {txStrList.map((txStr, i) => (
                <div className="py-2" key={i}>
                  <CopyHandle text={txStr}>
                    {utilsApp.shortenAddress(txStr, {
                      size: 35,
                    })}
                  </CopyHandle>
                </div>
              ))}
            </div>
          </OneDetailItem>
        </div>
      </div>
    </ApprovePageLayout>
  );
});

// message from popup -> bg -> content -> inpage -> dapp
function sendMessageToBg(message) {
  extension.runtime.sendMessage(
    DappMessageSOL.extensionRuntimeMessage({
      channel: CONST_DAPP_MESSAGE_TYPES.CHANNEL_POPUP_TO_BG,
      data: message,
    }),
  );
}

function PageApprovePopupSOL() {
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
    const requestObj = JSON.parse(request);

    // if method===sign, convert object data to Uint8Array
    if (requestObj.method === CONST_DAPP_METHODS_SOL.sign) {
      const dataObj = requestObj.params.data;
      // Deserialize `data` into a Uint8Array
      if (!dataObj) {
        throw new Error('Missing "data" params for "sign" request');
      }
      requestObj.params._dataRaw = requestObj.params.data;
      requestObj.params.data = utilsApp.objectToUint8Array(dataObj);
    }

    return {
      network, // chain network
      origin, // dapp origin
      request: requestObj,
    };
  }, [window.location.hash]);

  // dapp rpc requests queue
  const [requestsQueue, setRequestsQueue] = useState([query.request]);

  // Push requests from the parent window (opener) postMessage into a queue.
  //    TODO requestsQueue may only works at sollet Web Wallet
  useEffect(() => {
    function messageHandler(e) {
      // check event origin, source, target for safety
      if (e.origin === query.origin && e.source === window.opener) {
        if (
          e.data.method !== CONST_DAPP_METHODS_SOL.signTransaction &&
          e.data.method !== CONST_DAPP_METHODS_SOL.signAllTransactions &&
          e.data.method !== CONST_DAPP_METHODS_SOL.sign
        ) {
          sendMessageToBg(
            DappMessageSOL.errorMessage({
              id: e.data.id,
              error: `Unsupported approve method > ${e.data.method}`,
            }),
          );
        }

        setRequestsQueue((requests) => [...requests, e.data]);
      }
    }
    window.addEventListener('message', messageHandler);
    global.$ok_getApproveQuery = () => console.log(query);
    return () => window.removeEventListener('message', messageHandler);
  }, [query.origin, sendMessageToBg]);

  const request = requestsQueue[0];
  const popRequest = () => setRequestsQueue((requests) => requests.slice(1));

  const { messages, messageDisplay } = useMemo(() => {
    if (!request || request.method === CONST_DAPP_METHODS_SOL.connect) {
      return { messages: [], messageDisplay: 'tx' };
    }

    switch (request.method) {
      case CONST_DAPP_METHODS_SOL.signTransaction:
        return {
          messages: [request.params.message],
          messageDisplay: 'tx',
        };
      case CONST_DAPP_METHODS_SOL.signAllTransactions:
        return {
          messages: request.params.messages.map((m) => m),
          messageDisplay: 'tx',
        };
      case CONST_DAPP_METHODS_SOL.sign:
        if (!(request.params.data instanceof Uint8Array)) {
          throw new Error('Data must be an instance of Uint8Array');
        }
        return {
          messages: [bs58.encode(request.params.data)],
          messageDisplay: request.params.display === 'utf8' ? 'utf8' : 'hex',
        };
      default:
        throw new Error(`Unexpected approve method > ${request.method}`);
    }
  }, [request]);

  if (!request) {
    window.close();
    return null;
  }

  const onApprove = async ({
    autoApprove = false,
    // - plain text message bs58 encoded;
    // - tx data message serialized
    message,
    isBatch = false, // signAllTransactions
  } = {}) => {
    const wallet = storeWallet.currentWallet;
    // const txMessage = messages[0];
    const txMessageList = [].concat(message);

    // TODO check connectedWallets of this origin is matched with current selected Account
    const signatures = [];
    for (let i = 0; i < txMessageList.length; i++) {
      const txMessage = txMessageList[i];
      // TODO signAllTransactions here one by one
      const signature = await wallet.signTx(txMessage);
      signatures.push(signature);
    }

    // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L187
    // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L49

    const payload = {};
    if (isBatch) {
      payload.signatures = signatures;
    } else {
      payload.signature = signatures[0];
    }

    sendMessageToBg(
      DappMessageSOL.signedMessage({
        id: request.id,
        result: {
          ...payload,
          publicKey: storeAccount.currentAccountAddress,
        },
      }),
    );

    popRequest();
  };

  const onReject = () => {
    sendMessageToBg(
      DappMessageSOL.errorMessage({
        id: request.id,
        error: 'Transaction cancelled',
      }),
    );

    popRequest();
  };

  // signTransaction(txDataMessage)
  if (
    request.method === CONST_DAPP_METHODS_SOL.signTransaction ||
    request.method === CONST_DAPP_METHODS_SOL.signAllTransactions
  ) {
    const isBatch =
      request.method === CONST_DAPP_METHODS_SOL.signAllTransactions;
    // debugger;
    return (
      <ApproveTransaction
        query={query}
        isBatch={isBatch}
        onApprove={onApprove}
        onReject={onReject}
      />
    );
  }

  // signMessage(plainTextMessage)
  if (request.method === CONST_DAPP_METHODS_SOL.sign) {
    return (
      <ApproveSign query={query} onApprove={onApprove} onReject={onReject} />
    );
  }

  // connection(url)
  if (request.method === CONST_DAPP_METHODS_SOL.connect) {
    // Approve the parent page to connect to this wallet.
    const onConnect = ({ autoApprove = false } = {}) => {
      // * setConnectedAccount(wallet.publicKey);
      // * save to storage
      extension.storage.local.get('connectedWallets', (result) => {
        const connectedWallets = {
          ...result?.connectedWallets,
          [query.origin]: {
            publicKey: storeAccount.currentAccountAddress,
            autoApprove,
          },
        };
        extension.storage.local.set({
          connectedWallets,
          lastUpdateStorageTime: `${new Date().toString()} > PagePopup.js`,
        });
        extension.storage.local.get('connectedWallets', console.log);
      });

      // * send publicKey to inpage provider
      const publicKeySendToDapp = storeAccount.currentAccountAddress;
      sendMessageToBg(
        DappMessageSOL.connectedMessage({
          id: request.id,
          params: {
            publicKey: publicKeySendToDapp,
            // publicKey: '31NikDPFmkJQxJ2QbLGJhfSWzFMubFeS5Jegr524fcTy', // mock address to dapp
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
        onConnect={onConnect}
      />
    );
  }

  return (
    <AppPageLayout>
      <h1>approve method=[{request.method}] is not supported.</h1>
      <ReactJsonView collapsed={false} src={query} />
    </AppPageLayout>
  );
}

PageApprovePopupSOL.propTypes = {
  // children: PropTypes.any,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default observer(PageApprovePopupSOL);
