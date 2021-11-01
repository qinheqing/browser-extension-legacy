import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { Button, Badge, Icon } from '@onekeyhq/ui-components';
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
import styles from './index.css';

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
        <div className="pt-7 flex items-center">
          <Button
            type="basic"
            leadingIcon="ArrowUpOutline"
            onClick={() => {
              storeHistory.goToPageTransfer({
                token: storeToken.currentNativeToken,
              });
            }}
          >
            {t('send')}
          </Button>
          <div className="w-4" />
          <Button
            type="basic"
            leadingIcon="QrcodeOutline"
            onClick={() => {
              storeHistory.goToPageTokenDetail({
                token: storeToken.currentNativeToken,
              });
            }}
          >
            {t('receive')}
          </Button>
        </div>
      </div>
    </div>
  );
}

ExtAccountOverview.propTypes = {
  children: PropTypes.any,
};

export default observer(ExtAccountOverview);
