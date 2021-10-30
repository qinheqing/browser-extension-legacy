import React, {
  Component,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Button } from '@onekeyhq/ui-components';
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
  ROUTE_APPROVE_SETTINGS,
} from '../../routes/routeUrls';
import storeWallet from '../../store/storeWallet';
import storeToken from '../../store/storeToken';
import TokenInfoCard from '../../components/TokenInfoCard';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import utilsApp from '../../utils/utilsApp';
import TxSubmitSuccessView from '../../components/TxSubmitSuccessView';
import AppIcons from '../../components/AppIcons';
import OneButton from '../../components/OneButton';
import storeHistory from '../../store/storeHistory';
import storeChain from '../../store/storeChain';
import storeStorage from '../../store/storeStorage';
import storeApp from '../../store/storeApp';
import { ChainLogoIcon } from '../../components/LogoIcon';
import useInitFirstAccount from '../../hooks/useInitFirstAccount';
import openStandalonePage from '../../utils/openStandalonePage';
import { ExtAppHeader } from '../../components/ExtAppHeader';
import useRedirectToCorrectHome from '../../hooks/useRedirectToCorrectHome';
import useI18n from '../../hooks/useI18n';

const LockScreenButton = () => (
  <HomeTopActionButton
    text="锁屏"
    icon={AppIcons.LockClosedIcon}
    onClick={storeApp.lockScreen}
  />
);

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
        text="授权"
        icon={AppIcons.ShieldExclamationIcon}
        onClick={() => {
          storeHistory.push(ROUTE_APPROVE_SETTINGS);
        }}
      />

      <LockScreenButton />
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
          storeAccount.refreshKey = new Date().getTime();
          await utilsApp.delay(1500);
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
            onClick={() => openStandalonePage(ROUTE_HOME, '')}
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

// TODO redirect to oldHome useRedirectToCorrectHome
function PageHome() {
  const history = useHistory();
  const [copied, handleCopy] = useCopyToClipboard();
  const { isUnlocked } = storeApp.legacyState;
  const { currentAccountAddress } = storeAccount;
  const initAccountReady = useInitFirstAccount();
  const t = useI18n();

  useEffect(() => {
    if (initAccountReady && currentAccountAddress) {
      storeToken.fetchCurrentAccountTokens();
    }
  }, [initAccountReady, currentAccountAddress]);

  useEffect(() => {
    (async () => {
      if (initAccountReady && isUnlocked && currentAccountAddress) {
        await storeAccount.autofixMismatchAddresses();
      }
    })();
  }, [initAccountReady, isUnlocked, currentAccountAddress]);

  const onAccountClick = useCallback(() => {
    storeHistory.push(ROUTE_ACCOUNT_DETAIL);
  }, []);

  if (useRedirectToCorrectHome({ fromNewHome: true })) {
    return null;
  }

  if (!initAccountReady) {
    return null;
  }

  const contentView = (() => {
    const { isHardwareOnlyMode } = storeApp;
    if (!currentAccountAddress) {
      const hardwareConnectBtn = storeChain.currentChainSupportHardware ? (
        <Button onClick={() => storeHistory.goToPageConnectHardware()}>
          {t('connectHardwareWallet')}
        </Button>
      ) : (
        <span>当前网络不支持硬件</span>
      );
      return (
        <div className="h-full u-flex-center flex-col px-4">
          <ChainLogoIcon />

          <div className="my-4">
            {isHardwareOnlyMode ? (
              hardwareConnectBtn
            ) : (
              <Button onClick={() => storeHistory.goToPageCreateAccount()}>
                {t('createAccount')}
              </Button>
            )}
          </div>

          <LockScreenButton />
        </div>
      );
    }

    return (
      <>
        <AccountCard
          key={storeAccount.refreshKey}
          showMaskAssetBalanceEye
          maskAssetBalance={storeStorage.maskAssetBalance}
          account={storeAccount.currentAccountInfo}
          showBalance
          watchBalanceChange
          showActiveBadge={false}
          onClick={onAccountClick}
        />
        <div className="bg-white shadow-2xl py-1 px-4 min-h-screen">
          <HomeTopActionsBar />
          <div>
            <HomeAssetsHeader />
            <HomeAssetsList key={storeAccount.refreshKey} />
          </div>
        </div>
      </>
    );
  })();

  const navLeft = currentAccountAddress ? (
    <AppIcons.ClipboardListIcon
      role="button"
      className="w-6"
      onClick={() => storeHistory.push(ROUTE_TX_HISTORY)}
    />
  ) : null;
  const navRight = (
    <AppIcons.CollectionIcon
      role="button"
      className="w-6"
      onClick={() => {
        storeAccount.setAccountsGroupFilterToChain({
          chainKey: storeChain.currentChainKey,
        });
        storeHistory.push(ROUTE_WALLET_SELECT);
      }}
    />
  );
  return (
    <AppPageLayout
      navLeft={navLeft}
      navRight={navRight}
      headerView={<ExtAppHeader />}
      title="钱包"
    >
      {contentView}
    </AppPageLayout>
  );
}

export default observer(PageHome);
