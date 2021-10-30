import React, { useCallback, useRef } from 'react';
import { Account, AccountSelector, Badge } from '@onekeyhq/ui-components';
import { observer } from 'mobx-react-lite';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';
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
import useI18n from '../../hooks/useI18n';
import {
  IMPORT_ACCOUNT_ROUTE,
  NEW_ACCOUNT_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import { goToPageConnectHardware } from '../../../ui/app/helpers/utils/util';
import storeApp from '../../store/storeApp';
import openStandalonePage from '../../utils/openStandalonePage';
import {
  ROUTE_CONNECT_HARDWARE,
  ROUTE_CREATE_ACCOUNT,
} from '../../routes/routeUrls';
import storeHistory from '../../store/storeHistory';
import useCurrentAccountAvailable from '../../hooks/useCurrentAccountAvailable';

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
  const t = useI18n();
  return (
    <AccountSelector.OptionGroup title={t('myAccounts')}>
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
  const history = useHistory();
  const triggerBtnRef = useRef(null);
  const available = useCurrentAccountAvailable();
  const close = useCallback(() => {
    triggerBtnRef?.current?.click();
  }, []);
  const t = useI18n();
  const canCreateWalletAccount = !storeApp.isHardwareOnlyMode;
  const canImportSingleChainAccount =
    !storeApp.isHardwareOnlyMode && utilsApp.isOldHome();
  const canConnectHardware =
    utilsApp.isOldHome() || storeChain.currentChainInfo?.hardwareSupport;

  if (!available) {
    return null;
  }

  return (
    <AccountSelector
      triggerButtonRef={(ref) => (triggerBtnRef.current = ref)}
      actions={[
        canCreateWalletAccount && {
          content: t('createAccount'),
          iconName: 'PlusSolid',
          onAction: () => {
            storeHistory.goToPageCreateAccount();
            close();
          },
        },
        canImportSingleChainAccount && {
          content: t('importAccount'),
          iconName: 'DownloadSolid',
          onAction: () => {
            history.push(IMPORT_ACCOUNT_ROUTE);
            close();
          },
        },
        canConnectHardware && {
          content: t('connectHardwareWallet'),
          iconName: 'DeviceMobileOutline',
          onAction: () => {
            storeHistory.goToPageConnectHardware();
            close();
          },
        },
      ].filter(Boolean)}
      place="bottom-center"
      trigger={{
        account: getCurrentAccountInfo({ selectedIdentity }),
      }}
    >
      <div className="max-h-[420px] overflow-y-auto">
        <AccountSelectorDropdownList
          onClose={close}
          evmAccounts={evmAccounts}
          showAccountDetail={showAccountDetail}
          selectedIdentity={selectedIdentity}
        />
      </div>
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
