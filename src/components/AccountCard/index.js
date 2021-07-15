import React from 'react';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import storeChain from '../../store/storeChain';
import utilsApp from '../../utils/utilsApp';
import storeAccount from '../../store/storeAccount';
import TokenBalance from '../TokenBalance';
import OneTokenInfo from '../../classes/OneTokenInfo';
import AppIcons from '../AppIcons';
import { CONSTS_ACCOUNT_TYPES } from '../../consts/consts';
import CopyHandle from '../CopyHandle';
import storeToken from '../../store/storeToken';
import styles from './index.css';

function HardwareTypeTag() {
  return (
    <div className={classnames(styles.AccountCard__typeTag)}>
      <AppIcons.DeviceMobileIconSolid className="w-4" />
      <span>OneKey硬件</span>
    </div>
  );
}

function AccountCard({
  wallet,
  account,
  showBalance = false,
  watchBalanceChange = false,
  showActiveBadge = true,
  ...others
}) {
  if (!account || !account.address) {
    return null;
  }
  const chainInfo = storeChain.getChainInfoByKey(account.chainKey);
  const isActive =
    storeAccount.currentAccount &&
    storeAccount.currentAccount.chainKey === account.chainKey &&
    storeAccount.currentAccount.address === account.address;
  const tokenInfo = storeToken.buildNativeToken({
    account,
    chainInfo,
  });
  return (
    <div className={styles.AccountCard} {...others}>
      <header className={classnames(styles.AccountCard__header)}>
        {isActive && showActiveBadge && (
          <span className={classnames(styles.AccountCard__activeBadge)} />
        )}
        <span className={classnames(styles.AccountCard__name)}>
          {account.name || 'ACCOUNT_NAME'}
          <AppIcons.EyeIcon role="button" className="w-4 ml-1 " />
        </span>
        {account.type === CONSTS_ACCOUNT_TYPES.Hardware && <HardwareTypeTag />}
      </header>
      <div className={classnames(styles.AccountCard__address)}>
        <CopyHandle text={account.address}>
          {utilsApp.shortenAddress(account.address)}
        </CopyHandle>
      </div>

      <div className={classnames(styles.AccountCard__blank)} />
      {showBalance && (
        <footer>
          {/* TODO get balance in cache if at wallet select page */}
          <TokenBalance
            wallet={wallet}
            tokenInfo={tokenInfo}
            showUnit
            watchBalanceChange={watchBalanceChange}
            className={classnames(styles.AccountCard__balance)}
            showPrice
            classNamePrice={classnames(styles.AccountCard__balanceFiat)}
          />
        </footer>
      )}
    </div>
  );
}

export default observer(AccountCard);
