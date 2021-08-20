import React, {
  Component,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
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
  ROUTE_ACCOUNT_DETAIL,
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
import storeChain from '../../store/storeChain';
import storeStorage from '../../store/storeStorage';
import storeApp from '../../store/storeApp';
import storePrice from '../../store/storePrice';
import walletFactory from '../../wallets/walletFactory';
import OneAccountInfo from '../../classes/OneAccountInfo';
import {
  BACKGROUND_PROXY_MODULE_NAMES,
  CONSTS_ACCOUNT_TYPES,
} from '../../consts/consts';
import uiGetBgControllerAsync from '../../wallets/bg/uiGetBgControllerAsync';
import uiBackgroundProxy from '../../wallets/bg/uiBackgroundProxy';
import { I18nContext } from '../../../ui/app/contexts/i18n';

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
        text="锁屏"
        icon={AppIcons.LockClosedIcon}
        onClick={storeApp.lockScreen}
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

function RefreshButton() {
  const [loading, setLoading] = useState(false);
  return (
    <OneButton
      type="white"
      size="xs"
      rounded
      onClick={async () => {
        setLoading(true);
        try {
          await storeToken.fetchCurrentAccountTokens({
            forceUpdateTokenMeta: true,
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <AppIcons.RefreshIcon
        className={classnames('w-5 ', {
          'animate-spin': loading,
        })}
      />
    </OneButton>
  );
}

const HomeAssetsHeader = observer(function () {
  return (
    <div className="text-xl flex items-center justify-between">
      <span>资产</span>
      <div className="flex-1" />

      {utilsApp.isPopupEnvironment() && (
        <>
          {/* // Expand*/}
          <OneButton
            type="white"
            size="xs"
            rounded
            onClick={() => utilsApp.openStandalonePage(ROUTE_HOME)}
          >
            <AppIcons.ArrowsExpandIcon className="w-5" />
          </OneButton>
          <div className="w-2" />
        </>
      )}

      <RefreshButton />
      <div className="w-2" />

      {storeChain.currentChainInfo?.isTestNet && (
        <>
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
        </>
      )}

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
  const tokens = storeToken.currentTokens;

  return (
    <div className="py-3 -mx-4 ">
      {tokens.map((token, index) => {
        return (
          <TokenInfoCard
            key={token.contractAddress + index}
            maskAssetBalance={storeStorage.maskAssetBalance}
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
    storeAccount.initFirstAccount();
  }, []);

  useEffect(() => {
    storeToken.fetchCurrentAccountTokens();
  }, []);

  const onAccountClick = useCallback(() => {
    storeHistory.push(ROUTE_ACCOUNT_DETAIL);
  }, []);

  return (
    <AppPageLayout
      navLeft={
        storeAccount.currentAccountAddress ? (
          <AppIcons.ClipboardListIcon
            role="button"
            className="w-6"
            onClick={() => storeHistory.push(ROUTE_TX_HISTORY)}
          />
        ) : null
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
        <div className="h-full u-flex-center px-4">
          点击右上角按钮选择或创建账户
        </div>
      )}
      {storeAccount.currentAccount && (
        <>
          <AccountCard
            showMaskAssetBalanceEye
            maskAssetBalance={storeStorage.maskAssetBalance}
            account={storeAccount.currentAccount}
            showBalance
            watchBalanceChange
            showActiveBadge={false}
            onClick={onAccountClick}
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
