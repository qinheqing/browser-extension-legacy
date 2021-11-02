import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { Button, Badge, Icon } from '@onekeyhq/ui-components';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import TokenBalance from '../TokenBalance';
import storeToken from '../../store/storeToken';
import storeWallet from '../../store/storeWallet';
import useI18n from '../../hooks/useI18n';
import storeHistory from '../../store/storeHistory';
import { CONST_ACCOUNT_TYPES } from '../../consts/consts';
import storeAccount from '../../store/storeAccount';
import { HardwareTypeTag } from '../AccountCard';
import utilsApp from '../../utils/utilsApp';
import CopyHandle from '../CopyHandle';
import storeApp from '../../store/storeApp';
import AppIcons from '../AppIcons';
import storeStorage from '../../store/storeStorage';
import ExtAccountTypeBadge from '../ExtAccountTypeBadge';
import { getCurrentChainId, getProvider } from '../../../ui/app/selectors';
import { openSwap } from '../../../ui/lib/swap-utils';
import {
  RECEIVE_ROUTE,
  SEND_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import styles from './index.css';

const ExtAccountOverviewActionButtons = observer(function () {
  const history = useHistory();
  const t = useI18n();
  const { ticker = 'ETH' } = useSelector(getProvider);
  const chainId = useSelector(getCurrentChainId);
  const handleSwap = useCallback(() => openSwap(ticker), [ticker]);
  const isSwapEnable =
    utilsApp.isOldHome() && [1, 42, 56, 128, 137].includes(Number(chainId));

  return (
    <div className="pt-7 flex items-center">
      <Button
        type="basic"
        leadingIcon="ArrowUpOutline"
        onClick={() => {
          if (utilsApp.isNewHome()) {
            storeHistory.goToPageTransfer({
              token: storeToken.currentNativeToken,
            });
            return;
          }
          history.push(SEND_ROUTE);
        }}
      >
        {t('send')}
      </Button>
      <div className="w-2" />
      <Button
        type="basic"
        leadingIcon="QrcodeOutline"
        onClick={() => {
          if (utilsApp.isNewHome()) {
            storeHistory.goToPageTokenDetail({
              token: storeToken.currentNativeToken,
            });
            return;
          }
          history.push(RECEIVE_ROUTE);
        }}
      >
        {t('receive')}
      </Button>
      {isSwapEnable && (
        <>
          <div className="w-2" />
          <Button
            type="basic"
            leadingIcon="SwitchHorizontalOutline"
            onClick={handleSwap}
          >
            {t('swap')}
          </Button>
        </>
      )}
    </div>
  );
});

function ExtAccountOverview({ children }) {
  const { maskAssetBalance } = storeStorage;
  const t = useI18n();
  const onToggle = useCallback((e) => {
    e.stopPropagation();
    storeApp.toggleAssetBalanceVisible();
  }, []);
  const account = storeAccount.currentAccountInfo;
  if (!account) {
    return null;
  }
  return (
    <div>
      <div className="w-full px-4 py-2 flex items-center justify-between">
        <span onClick={onToggle}>
          {maskAssetBalance ? (
            <AppIcons.EyeOffIcon role="button" className="w-4 ml-1 " />
          ) : (
            <AppIcons.EyeIcon role="button" className="w-4 ml-1 " />
          )}
        </span>

        <div className="text-xs text-gray-400">
          <CopyHandle text={account.address}>
            {utilsApp.shortenAddress(account.address)}
          </CopyHandle>
        </div>

        <ExtAccountTypeBadge type={account?.type} />
      </div>

      <div className="flex flex-col items-center text-center p-4 pt-6">
        <div className="text-sm text-gray-400">Total Balance</div>
        <div>
          <TokenBalance
            showUnit
            showPrice
            watchBalanceChange
            maskAssetBalance={maskAssetBalance}
            className={classnames('text-3xl mt-2 block')}
            classNamePrice={classnames('text-sm text-gray-700')}
            classNameUnit={classnames('text-gray-600')}
          />
        </div>
        <ExtAccountOverviewActionButtons />
      </div>
    </div>
  );
}

ExtAccountOverview.propTypes = {
  children: PropTypes.any,
};

export default observer(ExtAccountOverview);
export { ExtAccountOverviewActionButtons };
