import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import AppPageLayout from '../../components/AppPageLayout';
import storeAccount from '../../store/storeAccount';
import AccountCard from '../../components/AccountCard';
import {
  ROUTE_HOME,
  ROUTE_HOME_OLD,
  ROUTE_TOKEN_DETAIL,
  ROUTE_TRANSFER,
  ROUTE_TX_HISTORY,
  ROUTE_WALLET_SELECT,
} from '../../routes/routeUrls';
import storeWallet from '../../store/storeWallet';
import storeToken from '../../store/storeToken';
import TokenInfoCard from '../../components/TokenInfoCard';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import utilsApp from '../../utils/utilsApp';
import storeTransfer from '../../store/storeTransfer';
import TxSubmitSuccessView from '../../components/TxSubmitSuccessView';
import AppIcons from '../../components/AppIcons';
import OneButton from '../../components/OneButton';
import storeHistory from '../../store/storeHistory';

const HomeTopActionsBar = observer(function () {
  const [copied, handleCopy] = useCopyToClipboard();

  return (
    <div className="flex items-center justify-around px-4 py-6">
      <HomeTopActionButton
        text="转账"
        icon={AppIcons.ArrowUpIcon}
        onClick={() => {
          storeHistory.goToPageTransfer({
            token: storeToken.currentNativeToken,
          });
        }}
      />

      <HomeTopActionButton
        text="收款"
        icon={AppIcons.ArrowDownIcon}
        onClick={() => {
          storeHistory.goToPageTokenDetail({
            token: storeToken.currentNativeToken,
          });
        }}
      />

      <HomeTopActionButton
        text="公告"
        icon={AppIcons.BellIcon}
        onClick={() => {
          console.log('Notice button click');
          global.testGlobalError.testGlobalErrorField = 1;
        }}
      />

      <HomeTopActionButton
        text="Dapp调试"
        icon={AppIcons.BeakerIcon}
        onClick={() => window.open('https://vef61.csb.app/')}
      />
    </div>
  );
});

const HomeTopActionButton = observer(function ({
  text,
  icon,
  onClick,
  ...others
}) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center" onClick={onClick} {...others}>
      <OneButton rounded type="gray" size="lg">
        <Icon className="w-6" />
      </OneButton>
      <div className="text-sm mt-1">{text}</div>
    </div>
  );
});

const HomeAssetsHeader = observer(function () {
  return (
    <div className="text-xl flex items-center justify-between">
      <span>资产</span>
      <div className="flex-1" />
      <OneButton
        type="white"
        size="xs"
        rounded
        onClick={() => storeHistory.push(ROUTE_TX_HISTORY)}
      >
        <AppIcons.ClipboardListIcon className="w-5" />
      </OneButton>
      <div className="w-2" />
      <OneButton
        type="white"
        size="xs"
        rounded
        onClick={() => storeToken.getCurrentAccountTokens()}
      >
        <AppIcons.RefreshIcon className="w-5" />
      </OneButton>
      <div className="w-2" />
      <OneButton
        type="white"
        size="xs"
        rounded
        onClick={() => {
          storeWallet.currentWallet.requestAirdrop().then((txid) => {
            utilsToast.toast.success(
              <TxSubmitSuccessView txid={txid}>
                Done! Airdrop request submitted
              </TxSubmitSuccessView>,
            );
          });
        }}
      >
        <AppIcons.PaperAirplaneIcon className="w-5" />
      </OneButton>
      <div className="w-2" />
      <OneButton
        type="white"
        size="xs"
        rounded
        onClick={() => storeHistory.goToPageTokenAdd()}
      >
        <AppIcons.PlusIcon className="w-5" />
      </OneButton>
    </div>
  );
});

const HomeAssetsList = observer(function () {
  return (
    <div className="py-3 -mx-4 ">
      {storeToken.currentTokens.map((token, index) => {
        return (
          <TokenInfoCard
            key={token.contractAddress + index}
            token={token}
            onClick={() => {
              storeHistory.goToPageTokenDetail({
                token,
              });
            }}
          />
        );
      })}
    </div>
  );
});

function PageHome() {
  const history = useHistory();
  const [copied, handleCopy] = useCopyToClipboard();

  useEffect(() => {
    storeToken.getCurrentAccountTokens();
  }, []);

  return (
    <AppPageLayout
      navLeft={
        utilsApp.isExtensionTypePopup() && (
          <AppIcons.ArrowsExpandIcon
            role="button"
            className="w-6"
            onClick={() => utilsApp.openStandalonePage(ROUTE_HOME)}
          />
        )
      }
      navRight={
        <AppIcons.CollectionIcon
          role="button"
          className="w-6"
          onClick={() => storeHistory.push(ROUTE_WALLET_SELECT)}
        />
      }
      title="钱包"
    >
      {!storeAccount.currentAccount && (
        <div>Please select or create account</div>
      )}
      {storeAccount.currentAccount && (
        <>
          <AccountCard
            account={storeAccount.currentAccount}
            showBalance
            watchBalanceChange
            showActiveBadge={false}
          />
          <div className="bg-white shadow-2xl py-1 px-4 min-h-screen">
            <HomeTopActionsBar />
            <div>
              <HomeAssetsHeader />
              <HomeAssetsList />
            </div>
          </div>
        </>
      )}
    </AppPageLayout>
  );
}

export default observer(PageHome);
