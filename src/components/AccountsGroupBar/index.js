import React from 'react';
import { Observer } from 'mobx-react-lite';
import classnames from 'classnames';
import storeChain from '../../store/storeChain';
import storeAccount from '../../store/storeAccount';
import { CONST_ACCOUNTS_GROUP_FILTER_TYPES } from '../../consts/consts';

function AccountsGroupItem({
  icon,
  children,
  isActive = false,
  onRemove,
  size = 'normal',
  ...others
}) {
  return (
    <div
      className={classnames('AccountsGroupItem', {
        'is-active': isActive,
        [`size-${size}`]: true,
      })}
      {...others}
    >
      {onRemove && (
        <div onClick={onRemove} className="AccountsGroupItem__remove">
          &times;
        </div>
      )}
      <div className="AccountsGroupItem__icon" />
      <div className="AccountsGroupItem__text">{children}</div>
    </div>
  );
}

function AccountsGroupItemChain({ chainKey }) {
  const chainInfo = storeChain.getChainInfoByKey(chainKey);
  return (
    <Observer>
      {() => {
        return (
          <AccountsGroupItem
            icon={chainInfo.icon}
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
          >
            {chainInfo.name}
          </AccountsGroupItem>
        );
      }}
    </Observer>
  );
}

function AccountsGroupItemHardware() {
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
    >
      Hardware
    </AccountsGroupItem>
  );
}

function AccountsGroupItemWallet() {
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
    >
      Wallet
    </AccountsGroupItem>
  );
}

function AccountsGroupItemSort() {
  return (
    <AccountsGroupItem icon="" size="small">
      Sort
    </AccountsGroupItem>
  );
}

function AccountsGroupItemCustomCreate() {
  return (
    <AccountsGroupItem icon="" onClick={() => storeChain.addChainTest()}>
      + Custom
    </AccountsGroupItem>
  );
}

// eslint-disable-next-line react/prop-types
export default function AccountsGroupBar() {
  return (
    <Observer>
      {() => {
        return (
          <div className="AccountsGroupBar">
            <AccountsGroupItemSort />
            <AccountsGroupItemWallet />
            <AccountsGroupItemHardware />
            {storeChain.chainsKeys.map((key) => {
              return <AccountsGroupItemChain key={key} chainKey={key} />;
            })}
            <AccountsGroupItemCustomCreate />
          </div>
        );
      }}
    </Observer>
  );
}
