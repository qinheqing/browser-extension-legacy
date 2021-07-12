import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import storeChain from '../../store/storeChain';
import storeAccount from '../../store/storeAccount';
import { CONST_ACCOUNTS_GROUP_FILTER_TYPES } from '../../consts/consts';
import storeApp from '../../store/storeApp';
import { ROUTE_HOME_OLD } from '../../routes/routeUrls';
import storeHistory from '../../store/storeHistory';
import styles from './index.css';

const AccountsGroupItem = observer(function ({
  icon,
  children,
  isActive = false,
  onRemove,
  size = 'normal',
  expand = false,
  ...others
}) {
  return (
    <div
      className={classnames('hover:bg-gray-50', styles.AccountsGroupItem, {})}
      {...others}
    >
      {onRemove && (
        <div onClick={onRemove} className={styles.AccountsGroupItem__remove}>
          &times;
        </div>
      )}
      <div
        className={classnames('u-flex-center', styles.AccountsGroupItem__icon, {
          [styles.AccountsGroupItem__icon_active]: isActive,
          [styles.AccountsGroupItem__icon_small]: size === 'small',
        })}
      >
        {icon && <img className="max-w-full max-h-full" src={icon} />}
      </div>
      {expand && (
        <div
          className={classnames(styles.AccountsGroupItem__text, {
            [styles.AccountsGroupItem__text_active]: isActive,
          })}
        >
          {children}
        </div>
      )}
    </div>
  );
});

const AccountsGroupItemChain = observer(function ({ chainKey, ...others }) {
  const chainInfo = storeChain.getChainInfoByKey(chainKey);
  return (
    <AccountsGroupItem
      icon={chainInfo.logo}
      onClick={() => {
        storeAccount.accountsGroupFilter = {
          type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.chain,
          chainKey,
        };
      }}
      isActive={storeAccount.accountsGroupFilter?.chainKey === chainKey}
      onRemove={
        chainInfo.isCustom
          ? () => {
              if (global.confirm('Are you sure to remove chain?')) {
                // TODO move the remove button to chain sort component
                storeChain.removeCustomChain(chainInfo.key);
              }
            }
          : null
      }
      {...others}
    >
      {chainInfo.name}
    </AccountsGroupItem>
  );
});

const AccountsGroupItemHardware = observer(function ({ ...others }) {
  return (
    <AccountsGroupItem
      onClick={() => {
        storeAccount.accountsGroupFilter = {
          type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.hardware,
        };
      }}
      isActive={
        storeAccount.accountsGroupFilter?.type ===
        CONST_ACCOUNTS_GROUP_FILTER_TYPES.hardware
      }
      icon=""
      {...others}
    >
      Hardware
    </AccountsGroupItem>
  );
});

const AccountsGroupItemWallet = observer(function ({ ...others }) {
  return (
    <AccountsGroupItem
      onClick={() => {
        storeAccount.accountsGroupFilter = {
          type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.wallet,
        };
      }}
      isActive={
        storeAccount.accountsGroupFilter?.type ===
        CONST_ACCOUNTS_GROUP_FILTER_TYPES.wallet
      }
      icon=""
      {...others}
    >
      Wallet
    </AccountsGroupItem>
  );
});

const AccountsGroupItemSort = observer(function ({ ...others }) {
  return (
    <AccountsGroupItem
      icon="images/chains/ethereum.svg"
      size="small"
      onClick={() => {
        storeApp.homeType = 'OLD';
        storeHistory.push(ROUTE_HOME_OLD);
      }}
      {...others}
    >
      选择更多网络
    </AccountsGroupItem>
  );
});

const AccountsGroupItemCustomCreate = observer(function ({ ...others }) {
  return (
    <AccountsGroupItem
      icon=""
      onClick={() => storeChain.addChainTest()}
      {...others}
    >
      + Custom
    </AccountsGroupItem>
  );
});

// eslint-disable-next-line react/prop-types
function AccountsGroupBar() {
  const [expand, setExpand] = useState(false);
  const childProps = { expand };
  return (
    <div className="w-12 h-full">
      <div
        className={classnames(
          'h-full relative flex flex-col items-stretch bg-white shadow-md overflow-y-auto',
          {
            'w-48': expand,
          },
        )}
        onClick={() => setExpand(false)}
        onMouseEnter={() => {
          setExpand(true);
          console.log('expand group bar');
        }}
        onMouseLeave={() => setExpand(false)}
      >
        <AccountsGroupItemSort {...childProps} />
        {/* <AccountsGroupItemWallet {...childProps} />*/}
        {/* <AccountsGroupItemHardware {...childProps} />*/}
        {storeChain.chainsKeys.map((key) => {
          return (
            <AccountsGroupItemChain {...childProps} key={key} chainKey={key} />
          );
        })}
        {/* <AccountsGroupItemCustomCreate {...childProps} />*/}
      </div>
    </div>
  );
}

export default observer(AccountsGroupBar);
