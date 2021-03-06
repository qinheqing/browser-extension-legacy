import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import storeChain from '../../store/storeChain';
import utilsApp from '../../utils/utilsApp';
import storeAccount from '../../store/storeAccount';
import storeApp from '../../store/storeApp';
import storeStorage from '../../store/storeStorage';
import TokenBalance from '../TokenBalance';
import AppIcons from '../AppIcons';
import { CONST_ACCOUNT_TYPES } from '../../consts/consts';
import CopyHandle from '../CopyHandle';
import storeToken from '../../store/storeToken';
import { ChainLogoIcon } from '../LogoIcon';
import styles from './index.css';

function HardwareTypeTag({ label = '' }) {
  return (
    <div className={classnames(styles.AccountCard__typeTag)}>
      <AppIcons.DeviceMobileIconSolid className="w-4" />
      <span>{label}</span>
    </div>
  );
}

function AccountCard({
  wallet,
  account,
  showMaskAssetBalanceEye = false,
  showBalance = false,
  watchBalanceChange = false,
  maskAssetBalance = false,
  showActiveBadge = true,
  ...others
}) {
  const onToggle = useCallback((e) => {
    e.stopPropagation();
    storeApp.toggleAssetBalanceVisible();
  }, []);

  if (!account || !account.address) {
    return null;
  }

  const chainInfo = storeChain.getChainInfoByKey(account.chainKey);
  // the account is current selected account
  const isActive =
    storeAccount.currentAccountInfo &&
    storeAccount.currentAccountInfo.chainKey === account.chainKey &&
    storeAccount.currentAccountInfo.address === account.address;
  const tokenInfo = storeToken.buildNativeToken({
    account,
    chainInfo,
  });

  return (
    <div
      className={classnames(
        styles.AccountCard,
        'shadow hover:transform hover:scale-[1.01]',
      )}
      style={{
        background: chainInfo.colorBg ?? 'black',
      }}
      {...others}
    >
      <header className={classnames(styles.AccountCard__header)}>
        {isActive && showActiveBadge && (
          <span className={classnames(styles.AccountCard__activeBadge)} />
        )}
        <span className={classnames(styles.AccountCard__name)}>
          <span className="max-w-[200px] truncate">
            {account.name || 'ACCOUNT_NAME'}
          </span>
          {showMaskAssetBalanceEye && (
            <span onClick={onToggle}>
              {maskAssetBalance ? (
                <AppIcons.EyeOffIcon role="button" className="w-4 ml-1 " />
              ) : (
                <AppIcons.EyeIcon role="button" className="w-4 ml-1 " />
              )}
            </span>
          )}
        </span>
        <div className="flex-1" />
        {account.type === CONST_ACCOUNT_TYPES.Hardware && <HardwareTypeTag />}
      </header>
      <div className={classnames(styles.AccountCard__address)}>
        <CopyHandle text={account.address}>
          {utilsApp.shortenAddress(account.address)}
        </CopyHandle>
      </div>

      <div className={classnames(styles.AccountCard__blank)} />
      <footer className="flex items-end">
        {showBalance && (
          // TODO get balance in cache if at wallet select page
          <div>
            <TokenBalance
              wallet={wallet}
              tokenInfo={tokenInfo}
              showUnit
              maskAssetBalance={maskAssetBalance}
              watchBalanceChange={watchBalanceChange}
              className={classnames(styles.AccountCard__balance)}
              showPrice
              classNamePrice={classnames(styles.AccountCard__balanceFiat)}
            />
          </div>
        )}
        <div className="flex-1" />
        <ChainLogoIcon
          chainInfo={chainInfo}
          size="md"
          border={false}
          className="!bg-opacity-25 !bg-black"
        />
      </footer>
    </div>
  );
}

export default observer(AccountCard);
export { HardwareTypeTag };
