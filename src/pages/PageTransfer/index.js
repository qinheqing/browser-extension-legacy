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
import TokenSwitchDialog from '../../components/TokenSwitchDialog';
import OneInput from '../../components/OneInput';
import OneCellItem from '../../components/OneCellItem';
import useDataRequiredOrRedirect from '../../utils/hooks/useDataRequiredOrRedirect';
import { TokenLogoIcon } from '../../components/LogoIcon';
import storeChain from '../../store/storeChain';
import FeeInfoPanel from '../../components/FeeInfoPanel';
import useAutorun from '../../hooks/useAutorun';
import { OneField } from '../../components/OneField/OneField';
import { OneFieldItem } from '../../components/OneField/OneFieldItem';
import { OneFieldInputItem } from '../../components/OneField/OneFieldInputItem';

function PageTransfer() {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [txid, setTxid] = useState('');
  // add associate token
  const [contract, setContract] = useState(
    'GfiUpKtqoMzrmGUZygEvqHvs8dCKn2vkqgc8vUoFkEzr',
  );
  useEffect(() => {
    storeTransfer.clearData();
    if (storeWallet.currentWallet) {
      // noop
    }
  }, []);

  useAutorun(storeTransfer.autoRunFetchFeeInfo, []);

  if (useDataRequiredOrRedirect(storeTransfer.fromToken)) {
    return <div />;
  }

  const token = storeTransfer.fromToken;
  return (
    <AppPageLayout title="转账">
      <OneField>
        <OneFieldItem
          arrow
          onClick={() => setSwitchDialogOpen(true)}
          titleWrapped
          title="资产"
          end={
            <div className="flex items-center leading-none">
              <span>{token.symbolDisplay}</span>
              <span className="ml-2 u-leading-0">
                <TokenLogoIcon tokenInfo={token} size="sm" />
              </span>
            </div>
          }
        />
      </OneField>
      <OneField>
        <OneFieldItem titleWrapped title="收款账号" />
        <OneFieldInputItem
          value={storeTransfer.toAddress}
          onChange={(e) => (storeTransfer.toAddress = e.target.value)}
          placeholder="输入或粘贴地址"
          end000={
            <OneButton size="2xs" className="bg-transparent">
              粘贴
            </OneButton>
          }
        />
      </OneField>

      <OneField>
        <OneFieldItem titleWrapped title="数量" />
        <OneFieldInputItem
          border
          value={storeTransfer.amount}
          onChange={(e) => (storeTransfer.amount = e.target.value)}
          placeholder="输入转出金额"
          end={
            storeTransfer.feeInfo?.fee !== undefined && (
              <OneButton
                onClick={() => storeTransfer.fillMaxAmount()}
                size="2xs"
                className="bg-gray-100"
              >
                最大
              </OneButton>
            )
          }
        />
        <OneFieldItem
          title="余额"
          end={
            <TokenBalance
              showUnit
              tokenInfo={token}
              watchBalanceChange
              updateBalanceThrottle={0}
            />
          }
        />
      </OneField>

      <FeeInfoPanel feeInfo={storeTransfer.feeInfo} />

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
      <TokenSwitchDialog
        open={switchDialogOpen}
        onOpenChange={setSwitchDialogOpen}
      />
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
