import React, { useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import TimeAgo from 'react-timeago';
import timeAgoZhStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import AppPageLayout from '../../components/AppPageLayout';
import OneButton from '../../components/OneButton';
import storeWallet from '../../store/storeWallet';
import storeAccount from '../../store/storeAccount';
import utilsApp from '../../utils/utilsApp';
import AppIcons from '../../components/AppIcons';
import AmountText from '../../components/AmountText';
import LoadingSpinner from '../../components/LoadingSpinner';
import storeTx from '../../store/storeTx';
import storeHistory from '../../store/storeHistory';
import NoDataView from '../../components/NoDataView';
import OneCellItem from '../../components/OneCellItem';
import styles from './index.css';

const timeAgoLocaleFormatter = buildFormatter(timeAgoZhStrings);

function TransactionInfoIcon({ IconComponent, iconClassName, className }) {
  return (
    <div
      className={classnames(
        'w-10 h-10 rounded-full u-flex-center',
        className, //  bg-indigo-50
      )}
    >
      <IconComponent
        className={classnames(
          'w-5',
          iconClassName, // text-indigo-600
        )}
      />
    </div>
  );
}

function TransactionInfoCardView({
  loading = false,
  icon,
  title,
  content,
  time,
  onClick,
}) {
  if (loading) {
    // eslint-disable-next-line no-param-reassign
    icon = (
      <TransactionInfoIcon
        className="bg-green-50"
        iconClassName="w-6"
        IconComponent={LoadingSpinner}
      />
    );
    // eslint-disable-next-line no-param-reassign
    title = <span>发送中...</span>;
    // eslint-disable-next-line no-param-reassign
    content = <span>正在等待区块确认</span>;
  }
  return (
    <OneCellItem
      onClick={onClick}
      title={title}
      content={content}
      arrow
      appearance="card"
      start={icon}
      end={<TimeAgo date={time} formatter={timeAgoLocaleFormatter} />}
    />
  );
}

function InstructionsInfoCard({ onClick, account, txid, ix, time, txMeta }) {
  const { program, programId, parsed } = ix;
  // program: system, spl-token, ...
  const ixType = parsed.type;
  const { destination, lamports, source } = parsed.info || {};
  const okStatus = txMeta?.status?.Ok;
  let icon, title, content;
  const timeMs = time * 1000;

  const amount = lamports;
  const { decimals, currency } = account;

  if (program === 'system' && parsed.type === 'transfer') {
    if (destination === account.address) {
      icon = (
        <TransactionInfoIcon
          className="bg-blue-50"
          iconClassName="text-blue-600"
          IconComponent={AppIcons.ArrowDownIcon}
        />
      );
      title = (
        <span>
          接收 <AmountText value={amount} decimals={decimals} /> {currency}
        </span>
      );
      content = <span>发送方: {utilsApp.shortenAddress(source)}</span>;
    } else if (source === account.address) {
      icon = (
        <TransactionInfoIcon
          className="bg-yellow-50"
          iconClassName="text-yellow-600"
          IconComponent={AppIcons.ArrowUpIcon}
        />
      );
      title = (
        <span>
          发送 <AmountText value={amount} decimals={decimals} /> {currency}
        </span>
      );
      content = <span>接收方: {utilsApp.shortenAddress(destination)}</span>;
    }
  } else {
    icon = (
      <TransactionInfoIcon
        className="bg-green-50"
        iconClassName="text-green-600"
        IconComponent={AppIcons.CheckIcon}
      />
    );
    title = utilsApp.shortenAddress(txid);
    content = <span>交易成功</span>;
  }

  return (
    <TransactionInfoCardView
      loading={false}
      title={title}
      icon={icon}
      content={content}
      time={timeMs}
      onClick={onClick}
    />
  );
}

function TransactionInfoCard({ account, tx, onClick }) {
  const txid = tx?.transaction?.signatures?.[0];
  const time = tx?.blockTime;
  const instructions = tx?.transaction?.message?.instructions || [];
  return (
    <>
      {instructions.map((ix, index) => (
        <InstructionsInfoCard
          onClick={onClick}
          key={index}
          account={account}
          ix={ix}
          txid={txid}
          time={time}
          txMeta={tx.meta || {}}
        />
      ))}
    </>
  );
}

function PendingTransactionCard({ txid, ...others }) {
  const [tx, setTx] = useState(null);
  async function confirmTransaction() {
    const res =
      await storeWallet.currentWallet.chainProvider.confirmTransaction({
        txid,
      });
    const res1 = await storeWallet.currentWallet.chainProvider.getTransactions({
      ids: [txid],
    });
    const confirmedTx = res1?.items?.[0];
    if (confirmedTx) {
      setTx(confirmedTx);
    }
    console.log('confirmTransaction', res, res1);
  }
  useEffect(() => {
    confirmTransaction();
  }, []);

  if (tx) {
    return <TransactionInfoCard tx={tx} {...others} />;
  }

  return <TransactionInfoCardView loading {...others} />;
}

function PageTransactionHistory() {
  const [txList, setTxList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTxHistory();
  }, []);

  async function fetchTxHistory() {
    try {
      setLoading(true);
      const res = await storeWallet.currentWallet.getTxHistory({
        address: storeAccount.currentAccountAddress,
      });
      setTxList(res.items);
      storeTx.filterPendingTxConfirmed(res.items);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppPageLayout
      navRight={
        <AppIcons.ExternalLinkIcon
          className="w-6 cursor-pointer"
          onClick={() =>
            window.open(
              storeWallet.currentWallet.getBrowserLink({
                account: storeAccount.currentAccountAddress,
              }),
            )
          }
        />
      }
      title="交易记录"
    >
      {loading && <LoadingSpinner fullHeight />}
      {!loading && (
        <>
          {!storeTx.pendingTx.length && !txList.length && (
            <NoDataView fullHeight />
          )}

          {storeTx.pendingTx.map((txid) => (
            <PendingTransactionCard
              key={txid}
              txid={txid}
              account={storeAccount.currentAccount}
              onClick={() => {
                storeHistory.openBrowserLink({ tx: txid });
              }}
            />
          ))}

          {txList.map((tx) => {
            const txid = tx?.transaction?.signatures?.[0];
            return (
              <TransactionInfoCard
                key={txid}
                tx={tx}
                account={storeAccount.currentAccount}
                onClick={() => {
                  storeHistory.openBrowserLink({ tx: txid });
                }}
              />
            );
          })}
        </>
      )}
    </AppPageLayout>
  );
}

PageTransactionHistory.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageTransactionHistory);
