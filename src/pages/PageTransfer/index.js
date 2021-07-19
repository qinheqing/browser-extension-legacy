import React, { useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AppPageLayout from '../../components/AppPageLayout';
import storeTransfer from '../../store/storeTransfer';
import TokenBalance from '../../components/TokenBalance';
import NavBackButton from '../../components/NavBackButton';
import storeWallet from '../../store/storeWallet';
import utilsToast from '../../utils/utilsToast';
import TxSubmitSuccessView from '../../components/TxSubmitSuccessView';
import AppIcons from '../../components/AppIcons';
import OneButton from '../../components/OneButton';
import AmountText from '../../components/AmountText';
import storeToken from '../../store/storeToken';
import utilsNumber from '../../utils/utilsNumber';
import TransferConfirmDialog from '../../components/TransferConfirmDialog';
import OneInput from '../../components/OneInput';
import OneCellItem from '../../components/OneCellItem';
import useRequiredData from '../../utils/hooks/useRequiredData';
import TokenIcon from '../../components/TokenIcon';

function CmpFieldInputItem({ border, placeholder, right, ...others }) {
  return (
    <CmpFieldItem border={border}>
      <OneInput
        bgTransparent
        placeholder={placeholder}
        right={right}
        {...others}
      />
    </CmpFieldItem>
  );
}

function CmpFieldItemSplit() {
  return <div className="my-2 border-t" />;
}

function CmpFieldItem({
  title,
  titleWrapped = false,
  end,
  arrow = false,
  className,
  border = false,
  ...others
}) {
  const titleView = title && (
    <div
      className={classnames('text-sm inline-block', {
        'bg-gray-100 rounded-full px-2 py-0 ': titleWrapped,
      })}
    >
      {title}
    </div>
  );
  const endView = end && <div className="text-sm">{end}</div>;
  return (
    <OneCellItem
      title={titleView}
      end={endView}
      className={classnames('', className)}
      arrow={arrow}
      border={border}
      {...others}
    />
  );
}

function CmpField({ children }) {
  return <div className="bg-white my-4">{children}</div>;
}

function PageTransfer() {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [txid, setTxid] = useState('');
  // add associate token
  const [contract, setContract] = useState(
    'GfiUpKtqoMzrmGUZygEvqHvs8dCKn2vkqgc8vUoFkEzr',
  );
  useEffect(() => {
    storeTransfer.clearData();
    if (storeWallet.currentWallet) {
      storeTransfer.fetchTransactionFee();
    }
  }, []);

  if (
    !useRequiredData({
      data: storeTransfer.fromToken,
    })
  ) {
    return <div />;
  }

  const token = storeTransfer.fromToken;
  return (
    <AppPageLayout title="转账">
      <CmpField>
        <CmpFieldItem titleWrapped title="收款账号" />
        <CmpFieldInputItem
          value={storeTransfer.toAddress}
          onChange={(e) => (storeTransfer.toAddress = e.target.value)}
          placeholder="输入或粘贴地址"
          right000={
            <OneButton size="2xs" className="bg-transparent">
              粘贴
            </OneButton>
          }
        />
      </CmpField>

      <CmpField>
        <CmpFieldItem
          titleWrapped
          title="数量"
          end={
            <div className="flex items-center leading-none">
              <span>{token.symbolDisplay}</span>
              <span className="ml-2 u-leading-0">
                <TokenIcon tokenInfo={token} size="sm" />
              </span>
            </div>
          }
        />
        <CmpFieldInputItem
          border
          value={storeTransfer.amount}
          onChange={(e) => (storeTransfer.amount = e.target.value)}
          placeholder="输入转出金额"
          right={
            <OneButton
              onClick={() => storeTransfer.fillMaxAmount()}
              size="2xs"
              className="bg-gray-100"
            >
              最大
            </OneButton>
          }
        />
        <CmpFieldItem
          title="余额"
          end={<TokenBalance showUnit tokenInfo={token} />}
        />
      </CmpField>

      <CmpField>
        <CmpFieldItem
          titleWrapped
          title="交易费"
          end={
            <span>
              {storeTransfer.fee}
              <span className="ml-1">{storeTransfer.feeSymbol}</span>
            </span>
          }
        />
      </CmpField>

      <div className="px-4">
        <OneButton
          disabled={!storeTransfer.toAddress || !storeTransfer.amount}
          block
          size="xl"
          onClick={() =>
            storeTransfer
              .previewTransfer()
              .then((result) => result && setConfirmDialogOpen(true))
          }
        >
          发送
        </OneButton>
      </div>

      <TransferConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
      />
    </AppPageLayout>
  );
}

PageTransfer.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageTransfer);
