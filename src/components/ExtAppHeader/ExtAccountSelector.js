import React, { useCallback, useRef } from 'react';
import { Account, AccountSelector, Badge } from '@onekeyhq/ui-components';
import { observer } from 'mobx-react-lite';
import { connect } from 'react-redux';
import classnames from 'classnames';
import utilsApp from '../../utils/utilsApp';
import storeAccount from '../../store/storeAccount';
import {
  getMetaMaskAccountsOrdered,
  getMetaMaskKeyrings,
  getSelectedIdentity,
} from '../../../ui/app/selectors';
import storeChain from '../../store/storeChain';
import storeToken from '../../store/storeToken';
import styles from '../AccountCard/index.css';
import TokenBalance from '../TokenBalance';
import { PRIMARY } from '../../../ui/app/helpers/constants/common';
import UserPreferencedCurrencyDisplay from '../../../ui/app/components/app/user-preferenced-currency-display';
import * as actions from '../../../ui/app/store/actions';

function getCurrentAccountInfo({ selectedIdentity }) {
  /*  selectedIdentity
  address: "0x67e49a99843325b4a7ed43effb1da911540c86a6"
  lastSelected: 1635400145153
  name: "Account 1"
   */
  let address = '0x00000000';
  let label = 'UNSET_NAME';
  if (utilsApp.isNewHome()) {
    // TODO CFX shorten address length is different
    address = storeAccount.currentAccountAddress || address;
    label = storeAccount.currentAccountInfo?.name || label;
  } else if (selectedIdentity) {
    address = selectedIdentity.address || address;
    label = selectedIdentity.name || label;
  }
  return {
    address,
    label,
  };
}

const AccountItemBase = function ({
  isSelected,
  onSelect,
  address,
  label,
  balance,
  type,
}) {
  return (
    <AccountSelector.Option isSelected={isSelected} onAction={onSelect}>
      <Account address={address} label={label} balance={balance} symbol="" />
      {type && <Badge>{type}</Badge>}
    </AccountSelector.Option>
  );
};

const AccountItemEVM = observer(function ({
  account,
  selectedIdentity,
  onSelect,
}) {
  /*  selectedIdentity
  address: "0x67e49a99843325b4a7ed43effb1da911540c86a6"
  lastSelected: 1635400145153
  name: "Account 1"
  */

  /* evmAccounts
  accountKeyring: {type: 'HD Key Tree', accounts: Array(2)}
  accountType: "default"
  address: "0x67e49a99843325b4a7ed43effb1da911540c86a6"
  balance: "0x0"
  lastSelected: 1635498541128
  name: "Account 1"
  */
  const isSelected = selectedIdentity?.address === account.address;
  return (
    <AccountItemBase
      address={account.address}
      label={account.name}
      balance={
        <UserPreferencedCurrencyDisplay
          value={account.balance}
          type={PRIMARY}
        />
      }
      isSelected={isSelected}
      onSelect={onSelect}
      // renderKeyringType
      type={account.accountType}
    />
  );
});

const AccountItem = observer(function ({ account, onSelect }) {
  const chainInfo = storeChain.getChainInfoByKey(account.chainKey);
  // the account is current selected account
  const isSelected =
    storeAccount.currentAccountInfo &&
    storeAccount.currentAccountInfo.chainKey === account.chainKey &&
    storeAccount.currentAccountInfo.address === account.address;
  const tokenInfo = storeToken.buildNativeToken({
    account,
    chainInfo,
  });

  return (
    <AccountItemBase
      address={account.address}
      label={account.name}
      balance={
        <TokenBalance
          tokenInfo={tokenInfo}
          showUnit
          showPrice={false}
          watchBalanceChange={false}
        />
      }
      isSelected={isSelected}
      onSelect={onSelect}
      type={account.type}
    />
  );
});

const AccountSelectorDropdownList = observer(function ({
  onClose,
  evmAccounts,
  selectedIdentity,
  showAccountDetail,
}) {
  /* evmAccounts
  accountKeyring: {type: 'HD Key Tree', accounts: Array(2)}
  accountType: "default"
  address: "0x67e49a99843325b4a7ed43effb1da911540c86a6"
  balance: "0x0"
  lastSelected: 1635498541128
  name: "Account 1"
   */
  return (
    <AccountSelector.OptionGroup title="Accounts">
      {utilsApp.isNewHome() &&
        storeAccount.accountsListOfCurrentChain.map((account) => (
          <AccountItem
            key={account.chainKey + account.address}
            account={account}
            onSelect={() => {
              storeAccount.setCurrentAccount({ account });
              onClose();
            }}
          />
        ))}

      {/* EVM Accounts*/}
      {utilsApp.isOldHome() &&
        evmAccounts.map((account) => {
          return (
            <AccountItemEVM
              key={account.address}
              account={account}
              selectedIdentity={selectedIdentity}
              onSelect={() => {
                showAccountDetail(account.address);
                onClose();
              }}
            />
          );
        })}
    </AccountSelector.OptionGroup>
  );
});

const ExtAccountSelectorComponent = observer(function ({
  selectedIdentity,
  evmAccounts,
  showAccountDetail,
}) {
  const triggerBtnRef = useRef(null);
  const close = useCallback(() => {
    triggerBtnRef?.current?.click();
  }, []);

  return (
    <AccountSelector
      triggerButtonRef={(ref) => (triggerBtnRef.current = ref)}
      actions={[
        {
          content: 'Add Account',
          iconName: 'PlusSolid',
          onAction: () => close(),
        },
        {
          content: 'Setting',
          iconName: 'CogSolid',
          onAction: () => close(),
        },
        {
          content: 'Lock',
          iconName: 'LockClosedSolid',
          onAction: () => close(),
        },
      ]}
      place="bottom-center"
      trigger={{
        account: getCurrentAccountInfo({ selectedIdentity }),
      }}
    >
      <AccountSelectorDropdownList
        onClose={close}
        evmAccounts={evmAccounts}
        showAccountDetail={showAccountDetail}
        selectedIdentity={selectedIdentity}
      />
    </AccountSelector>
  );
});

// account-menu.component.js
// account-menu.container.js
const mapStateToProps = (state) => {
  const accounts = getMetaMaskAccountsOrdered(state);

  return {
    evmAccounts: accounts,
    keyrings: getMetaMaskKeyrings(state),
    selectedIdentity: getSelectedIdentity(state),
  };
};

function mapDispatchToProps(dispatch) {
  return {
    showAccountDetail: (address) => {
      dispatch(actions.showAccountDetail(address));
      dispatch(actions.hideSidebar());
      // dispatch(actions.toggleAccountMenu());
    },
  };
}

const ExtAccountSelector = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExtAccountSelectorComponent);

export { ExtAccountSelector };
