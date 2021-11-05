import { observer } from 'mobx-react-lite';
import { Button } from '@onekeyhq/ui-components';
import React, { useState } from 'react';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';
import useI18n from '../../hooks/useI18n';
import storeToken from '../../store/storeToken';
import TokenInfoCard from '../TokenInfoCard';
import storeStorage from '../../store/storeStorage';
import storeHistory from '../../store/storeHistory';
import storeChain from '../../store/storeChain';
import OneButton from '../OneButton';
import storeAccount from '../../store/storeAccount';
import utilsApp from '../../utils/utilsApp';
import AppIcons from '../AppIcons';
import storeWallet from '../../store/storeWallet';
import utilsToast from '../../utils/utilsToast';
import TxSubmitSuccessView from '../TxSubmitSuccessView';
import {
  ADD_TOKEN_ROUTE,
  ASSET_ROUTE,
  SEND_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import AssetList from '../../../ui/app/components/app/asset-list';

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
          await utilsApp.delay(1000);
          await storeToken.fetchCurrentAccountTokens({
            forceUpdateTokenMeta: true,
          });
          storeAccount.refreshKey = new Date().getTime();
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

function AirdropButton() {
  return (
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
  );
}

function TokenAddButton() {
  return (
    <OneButton
      type="white"
      size="xs"
      rounded
      onClick={() => storeHistory.goToPageTokenAdd()}
    >
      <AppIcons.PlusIcon className="w-5" />
    </OneButton>
  );
}

function TxHistoryButton() {
  return (
    <OneButton
      type="white"
      size="xs"
      rounded
      onClick={() => storeHistory.goToPageTxHistory()}
    >
      <AppIcons.ClockIcon className="w-5" />
    </OneButton>
  );
}

const HomeAssetsHeader = observer(function () {
  const t = useI18n();

  return (
    <div className="text-xl flex items-center justify-between my-4">
      <span>{t('assets')}</span>
      <div className="flex-1" />

      {utilsApp.isNewHome() && (
        <>
          <div className="w-2" />
          <RefreshButton />
        </>
      )}

      {utilsApp.isNewHome() && storeChain.currentChainInfo?.isTestNet && (
        <>
          <div className="w-2" />
          <AirdropButton />
        </>
      )}

      {/* <div className="w-2" /> */}
      {/* <TokenAddButton />*/}

      {/* <div className="w-2" />*/}
      {/* <TxHistoryButton />*/}
    </div>
  );
});

const ExtHomeAssetsList = observer(function () {
  const t = useI18n();
  const history = useHistory();
  let tokensListView = null;
  if (utilsApp.isNewHome()) {
    const tokens = storeToken.currentTokens;
    tokensListView = tokens.map((token, index) => {
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
    });
  } else {
    tokensListView = (
      <AssetList
        onClickAsset={(asset) => {
          // token-cell.js
          // e.stopPropagation();
          // dispatch(
          //   updateSendToken({
          //     address: tokenAddress,
          //     decimals: tokenDecimals,
          //     symbol: tokenSymbol,
          //   }),
          // );
          // history.push(SEND_ROUTE);
          history.push(`${ASSET_ROUTE}/${asset}`);
        }}
      />
    );
  }

  return (
    // className="min-h-screen" force lazyload scroll
    <div className="px-4">
      <HomeAssetsHeader />
      <div className="my-4 rounded-xl border overflow-hidden bg-white">
        {tokensListView}
        <div className="px-2 py-1 border-t">
          <Button
            className="flex justify-start"
            size="lg"
            type="plain"
            block
            leadingIcon="AdjustmentsOutline"
            onClick={() => {
              if (utilsApp.isNewHome()) {
                storeHistory.goToPageTokenAdd();
                return;
              }
              history.push(ADD_TOKEN_ROUTE);
            }}
          >
            {t('addTokens')}
          </Button>
        </div>
      </div>
    </div>
  );
});

export { ExtHomeAssetsList };
