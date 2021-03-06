import React, { useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import TimeAgo from 'react-timeago';
import timeAgoZhStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import { isNil } from 'lodash';
import { Link } from '@onekeyhq/ui-components';
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
import storeStorage from '../../store/storeStorage';
import ExtAppTabBar from '../../components/ExtAppTabBar';
import useI18n from '../../hooks/useI18n';
import ExtAppNavBar from '../../components/ExtAppNavBar';
import useDataRequiredOrRedirect from '../../utils/hooks/useDataRequiredOrRedirect';
import styles from './index.css';

const timeAgoLocaleFormatter = buildFormatter(timeAgoZhStrings);

function getTxid(tx) {
  return tx?.transaction?.signatures?.[0] ?? tx.hash;
}

function getTxTime(tx) {
  // TODO rpc getTransactionByHash NOT contains timestamp
  //    use chainManager.apiRpc.getBlockByHash
  return tx.blockTime ?? tx.timestamp;
}

function _getTxInstructions(tx) {
  const instructions = tx?.transaction?.message?.instructions || [];
  return instructions;
}

function getTxInfo(tx) {
  const instructions = _getTxInstructions(tx);
  if (instructions[0]) {
    return instructions[0];
  }
  const hasMethod = tx && tx.method !== '0x' && Boolean(tx.method);
  const info = {
    ...tx,
    program: hasMethod ? 'contract' : 'system', // system, other
    parsed: {
      method: hasMethod ? tx.method : '',
      type: 'transfer',
      info: {
        source: tx.from,
        destination: tx.to,
        lamports: tx.value?.toString() ?? tx.value,
      },
    },
  };
  return info;
}

function getTxError(tx) {
  if (tx?.meta?.err) {
    return tx?.meta?.err;
  }
  const successCode = 0;
  if (!isNil(tx.status) && tx.status !== successCode) {
    return 'Error';
  }
  return null;
}

function filterPendingTxConfirmed(confirmedTxList) {
  const pendingTxs = storeStorage.currentPendingTxid.filter((txid) => {
    return !confirmedTxList.find((confirmTx) => {
      const confirmId = getTxid(confirmTx);
      return confirmId === txid;
    });
  });
  storeStorage.currentPendingTxid = [...pendingTxs];
}

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
    title = <span>?????????...</span>;
    // eslint-disable-next-line no-param-reassign
    content = <span>????????????????????????</span>;
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

function InstructionsInfoCard({
  onClick,
  account,
  txid,
  ix,
  time,
  txMeta,
  error,
}) {
  const { program, programId, parsed } = ix;
  const timeMs = time * 1000;
  let title = utilsApp.shortenAddress(txid);
  let content = '????????????';
  let icon = (
    <TransactionInfoIcon
      className="bg-green-50"
      iconClassName="text-green-600"
      IconComponent={AppIcons.CheckIcon}
    />
  );

  if (parsed) {
    // program: system, spl-token, ...
    const ixType = parsed.type;
    const { destination, lamports, source } = parsed.info || {};
    const okStatus = txMeta?.status?.Ok;

    const amount = lamports;
    const { decimals, currency } = account;

    if (program === 'system' && ixType === 'transfer') {
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
            ?????? <AmountText value={amount} decimals={decimals} /> {currency}
          </span>
        );
        content = <span>?????????: {utilsApp.shortenAddress(source)}</span>;
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
            ?????? <AmountText value={amount} decimals={decimals} /> {currency}
          </span>
        );
        content = <span>?????????: {utilsApp.shortenAddress(destination)}</span>;
      }
    } else {
      // content = '????????????'
      // icon = null
    }
  }

  if (error) {
    content = '????????????';
    icon = (
      <TransactionInfoIcon
        className="bg-red-50"
        iconClassName="text-red-600"
        IconComponent={AppIcons.XIcon}
      />
    );
  }

  // CFX tx contract method name
  if (parsed && parsed.method) {
    content = (
      <div>
        {content}
        <div className="w-36 overflow-ellipsis overflow-hidden">
          {parsed.method}
        </div>
      </div>
    );
  }

  return (
    <TransactionInfoCardView
      icon={icon}
      title={title}
      content={content}
      time={timeMs}
      onClick={onClick}
    />
  );
}

function TransactionInfoCard({ account, tx, onClick }) {
  const txid = getTxid(tx);
  const time = getTxTime(tx);
  const info = getTxInfo(tx);
  const error = getTxError(tx);
  const meta = tx.meta || {};
  return (
    <InstructionsInfoCard
      onClick={onClick}
      error={error}
      account={account}
      ix={info}
      txid={txid}
      time={time}
      txMeta={meta}
    />
  );
}

function PendingTransactionCard({ txid, ...others }) {
  const [tx, setTx] = useState(null);
  const { chainManager } = storeWallet.currentWallet;

  useEffect(() => {
    async function confirmTransaction() {
      try {
        // start WSS WebSocket to confirmTransaction status
        const res = await chainManager.confirmTransaction({
          txid,
        });
        // res = {"context":{"slot":85562176},"value":{"err":null}}
        const res1 = await chainManager.getTransactions({
          ids: [txid],
        });
        const confirmedTx = res1?.items?.[0];
        if (confirmedTx) {
          setTx(confirmedTx);
          console.log('confirmTransaction', confirmedTx);
        }
      } catch (e) {
        // confirmTransaction timeout will throw exception
        console.error('PendingTransactionCard.confirmTransaction error', e);
      }
    }
    confirmTransaction();
    return () => {
      chainManager.confirmTransactionCancel({
        txid,
      });
    };
  }, [txid, chainManager]);

  if (tx) {
    return <TransactionInfoCard tx={tx} {...others} />;
  }

  return <TransactionInfoCardView loading {...others} />;
}

function PageTransactionHistory() {
  const t = useI18n();
  const [txList, setTxList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (storeAccount.currentAccountAddress) {
      fetchTxHistory();
    }
  }, []);

  if (useDataRequiredOrRedirect(storeAccount.currentAccountInfo)) {
    return <div />;
  }

  async function fetchTxHistory() {
    try {
      setLoading(true);
      const res = await storeWallet.currentWallet.getTxHistory({
        address: storeAccount.currentAccountAddress,
        limit: 20,
      });
      setTxList(res.items);
      filterPendingTxConfirmed(res.items);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppPageLayout
      header={
        <ExtAppNavBar
          title={t('activity')}
          subTitle={storeAccount.currentAccountAddressShort}
          left={null}
          right={
            <Link
              icon
              color
              className="cursor-pointer"
              onClick={(event) => {
                // event.preventDefault();
                storeHistory.openBlockBrowserLink({
                  account: storeAccount.currentAccountAddress,
                });
              }}
            />
          }
        />
      }
      footer={<ExtAppTabBar name={ExtAppTabBar.names.Transaction} />}
    >
      {loading && <LoadingSpinner fullHeight />}
      {!loading && (
        <>
          {!storeStorage.currentPendingTxid.length && !txList.length && (
            <NoDataView fullHeight>{t('noTransactions')}</NoDataView>
          )}

          {storeStorage.currentPendingTxid.map((txid) => (
            <PendingTransactionCard
              key={txid}
              txid={txid}
              account={storeAccount.currentAccountInfo}
              onClick={() => {
                storeHistory.openBlockBrowserLink({ tx: txid });
              }}
            />
          ))}

          {txList.map((tx) => {
            const txid = getTxid(tx);
            return (
              <TransactionInfoCard
                key={txid}
                tx={tx}
                account={storeAccount.currentAccountInfo}
                onClick={() => {
                  storeHistory.openBlockBrowserLink({ tx: txid });
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
