import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useState } from 'react';
import { isString } from 'lodash';

import { ChainLogoIcon } from '../../components/LogoIcon';
import OneButton from '../../components/OneButton';
import OneDetailItem, {
  OneDetailItemGroup,
} from '../../components/OneDetailItem';
import CopyHandle from '../../components/CopyHandle';
import utilsApp from '../../utils/utilsApp';
import OneArrow from '../../components/OneArrow';
import storeWallet from '../../store/storeWallet';
import storeTransfer from '../../store/storeTransfer';
import storeAccount from '../../store/storeAccount';
import AmountText from '../../components/AmountText';
import utilsNumber from '../../utils/utilsNumber';
import FeeInfoPanel, {
  FeeInfoPanelInDappApproval,
} from '../../components/FeeInfoPanel';
import utilsToast from '../../utils/utilsToast';
import uiDappApproval from '../../wallets/dapp/uiDappApproval';
import ApproveDappSiteInfo from './ApproveDappSiteInfo';
import ApprovePageLayout from './ApprovePageLayout';

function safeCapitalCase(str) {
  if (!isString(str)) {
    return '';
  }
  return utilsApp.changeCase.capitalCase(str);
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

function TxInstructionCardBase({ title, onClick, entries = [] }) {
  return (
    <div className="bg-white border rounded mx-4 my-2">
      {title && (
        <div className="border-b px-2 py-1.5 font-bold flex items-center">
          <span>{title}</span>
          <div className="flex-1" />
          {onClick && <OneArrow />}
        </div>
      )}
      <OneDetailItemGroup divide={false} className="px-2 py-2">
        {entries.map(([k, v]) => {
          return (
            <OneDetailItem
              compact
              key={k}
              // title={safeCapitalCase(k)}
              // content={<InstructionDataValueViewSOL value={v} />}
              title={k}
              content={v}
            />
          );
        })}
      </OneDetailItemGroup>
    </div>
  );
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

function TransactionItemView({
  txDecoded,
  index,
  showHeader = false,
  renderItem,
}) {
  if (!txDecoded) {
    return null;
  }
  const instructions = txDecoded?.instructions || [];
  return (
    <div>
      {showHeader && <div className="px-5 text-xl pt-2">交易 {index + 1}</div>}
      {instructions.map((instruction, i) => renderItem({ index, instruction }))}
    </div>
  );
}

async function decodeTxAsyncSOL(txStr) {
  const txDecoded = await storeWallet.currentWallet.decodeTransactionData({
    address: storeAccount.currentAccountAddress,
    data: txStr,
  });
  console.log('txDecoded', txDecoded);
  return txDecoded;
}

const ApproveTransaction = observer(function ({
  onReject,
  onApprove,
  query,
  isBatch = false,
  transactions,
  decodeTxAsync,
  renderItem = () => null,
}) {
  const txStrList = [].concat(transactions);
  const [loading, setLoading] = useState(false);
  const [txListDecoded, setTxListDecoded] = useState([]);
  const [feeInfo, setFeeInfo] = useState({});
  useEffect(() => {
    Promise.all(txStrList.map(async (txStr) => decodeTxAsync(txStr))).then(
      (txs) => setTxListDecoded(txs),
    );
    global.$ok_decodeTxAsync = decodeTxAsync;
  }, [
    // DO NOT use txStrList, cause infinite render
    transactions,
  ]);

  useEffect(() => {
    (async () => {
      // TODO multiple tx
      // TODO SOL refactor
      /*
      fee: "27224"
      gasLimit: "36298"
      gasPrice: "1"
      gasUsed: "27224"
       */
      const _feeInfo = await storeTransfer.fetchFeeInfo(transactions[0]);
      setFeeInfo(_feeInfo);
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
            loading={loading}
            block
            type="primary"
            onClick={async () => {
              try {
                setLoading(true);
                await onApprove({
                  autoApprove: false,
                  message: txStrList,
                  transactions: txStrList,
                  isBatch,
                });
              } finally {
                setLoading(false);
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
            renderItem={renderItem}
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

          <FeeInfoPanelInDappApproval feeInfo={feeInfo} />

          {/* <TransactionAccountsListView txDecoded={txDecoded} /> */}
          <OneDetailItem alignY title="原始数据">
            <div className="break-all divide-y w-full">
              {txStrList.map((txStr, i) => {
                if (!isString(txStr)) {
                  // eslint-disable-next-line no-param-reassign
                  txStr = JSON.stringify(txStr);
                }
                return (
                  <div className="py-2" key={i}>
                    <CopyHandle text={txStr}>
                      {utilsApp.shortenAddress(txStr, {
                        size: 35,
                      })}
                    </CopyHandle>
                  </div>
                );
              })}
            </div>
          </OneDetailItem>
        </div>
      </div>
    </ApprovePageLayout>
  );
});

const ApproveTransactionSOL = observer(function ({
  onReject,
  onApprove,
  query,
  isBatch = false,
}) {
  const transactions = isBatch
    ? query.request.params.messages
    : query.request.params.message;
  return (
    <ApproveTransaction
      transactions={transactions}
      onApprove={onApprove}
      onReject={onReject}
      query={query}
      isBatch={isBatch}
      decodeTxAsync={decodeTxAsyncSOL}
      renderItem={({ index, instruction }) => (
        <TxInstructionCardSOL key={index} instruction={instruction} />
      )}
    />
  );
});

function withCopyHandle(text, { shorten = true } = {}) {
  return (
    <CopyHandle text={text}>
      {shorten ? utilsApp.shortenAddress(text) : text}
    </CopyHandle>
  );
}

const TxInstructionCardCFX = observer(function ({ data }) {
  const { decimals, currency } = storeAccount.currentAccountInfo;
  // TODO try catch
  const amount = utilsNumber.hexToIntString(data.value);
  const amountView = (
    <span>
      <AmountText value={amount} decimals={decimals} /> {currency}
    </span>
  );
  const entries = [
    ['发送方', withCopyHandle(data.from)],
    ['接收方', withCopyHandle(data.to)],
    ['数据', withCopyHandle(data.data)],
    ['金额', amountView],
  ];
  // TODO safe render
  return <TxInstructionCardBase entries={entries} />;
});

const ApproveTransactionCFX = observer(function ({ query, isBatch = false }) {
  const wallet = storeWallet.currentWallet;
  // TODO multiple transaction params
  const tx = query.request.params[0];
  const onApprove = useCallback(async () => {
    // wallet.fetchTransactionFeeInfo
    // wallet.addFeeInfoToTx
    const txid = await wallet.signAndSendTxObject({
      tx,
    });
    if (txid) {
      utilsToast.toastTx({ txid, message: '交易提交成功' });
      await uiDappApproval.approveTransaction(query, txid);
      await utilsApp.delay(2000);
      window.close();
    }
  }, [query, tx, wallet]);

  const transactions = query.request.params;
  return (
    <ApproveTransaction
      transactions={transactions}
      onApprove={onApprove}
      onReject={window.close}
      query={query}
      isBatch={isBatch}
      decodeTxAsync={decodeTxAsyncSOL}
      renderItem={({ index, instruction }) => (
        <TxInstructionCardCFX data={instruction} />
      )}
    />
  );
});

export default ApproveTransaction;
export { ApproveTransactionSOL, ApproveTransactionCFX };
