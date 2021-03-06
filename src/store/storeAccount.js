/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { uniqBy, findIndex, isNil, cloneDeep } from 'lodash';
import {
  CONST_ACCOUNT_TYPES,
  CONST_ACCOUNTS_GROUP_FILTER_TYPES,
  CONST_CHAIN_KEYS,
} from '../consts/consts';
import OneAccountInfo from '../classes/OneAccountInfo';
import walletFactory from '../wallets/walletFactory';
import utilsApp from '../utils/utilsApp';
import uiGetBgControllerAsync from '../wallets/bg/uiGetBgControllerAsync';
import { WALLET_ACCOUNT_TYPES } from '../../ui/app/helpers/constants/common';
import BaseStore from './BaseStore';
import storeChain from './storeChain';
import storeWallet from './storeWallet';
import storeTx from './storeTx';
import storeStorage from './storeStorage';
import storeApp from './storeApp';
import createAutoRun from './createAutoRun';

class StoreAccount extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    this.setFirstChainKeyAsDefaultFilter();

    createAutoRun(
      () => {
        const { currentAccountInfo } = this;
        if (currentAccountInfo?.chainKey) {
          storeChain.setCurrentChainKey(currentAccountInfo?.chainKey);
        }
        console.log('clear pending tx on mount');
        storeTx.clearPendingTx();
      },
      () => {
        const { currentAccountRaw } = storeStorage;
      },
    )();

    // TODO do not use auto run to new Wallet, as currentAccount balance change will trigger this callback
    createAutoRun(
      () => {
        this.updateCurrentWallet();
      },
      () => {
        const { currentAccountRaw } = storeStorage;
        const { currentBaseChain } = storeChain;
      },
    )();

    createAutoRun(
      () => {
        const { isInitialized, isUnlocked } = storeApp;
        const isNewHome = utilsApp.isNewHome();
        if (isInitialized && isUnlocked) {
          this.initFirstAccount();
        }
      },
      () => {
        const { isHardwareOnlyMode, homeType } = storeApp;
        const { currentChainKey } = storeChain;
      },
    )();

    createAutoRun(
      () => {
        uiGetBgControllerAsync().then((bg) => {
          if (utilsApp.isNewHome()) {
            bg.disconnectAllDomainAccounts();
          } else {
            bg.emitAccountChangedToConnectedDomain(
              storeApp.legacyState.selectedAddress,
            );
          }
          bg.notifyChainIdChanged();
        });
      },
      () => {
        const { homeType } = storeStorage;
      },
    )();
  }

  updateCurrentWallet() {
    console.log('Create wallet instance');
    // TODO debounce
    const wallet = walletFactory.createWallet({
      chainInfo: storeChain.currentChainInfo,
      accountInfo: this.currentAccountInfo,
    });
    storeWallet.setCurrentWallet(wallet);
  }

  @observable.ref
  refreshKey = 1;

  // TODO rename to currentAccountInfo
  @computed
  get currentAccountInfo() {
    if (!storeStorage.currentAccountRaw) {
      return null;
    }
    const { chainKey, address } = storeStorage.currentAccountRaw;
    if (!address || !chainKey) {
      return null;
    }
    const chainInfo = storeChain.getChainInfoByKey(chainKey);
    if (!chainInfo) {
      return null;
    }
    return new OneAccountInfo({
      ...storeStorage.currentAccountRaw,
      currency: chainInfo.currency,
      decimals: storeWallet.currentWallet.options.balanceDecimals, // TODO move to chainInfo
    });
  }

  @computed
  get currentAccountAddress() {
    return this.currentAccountInfo?.address;
  }

  @computed
  get currentAccountChainKey() {
    return this.currentAccountInfo?.chainKey;
  }

  @computed
  get currentAccountTypeIsHardware() {
    return this.currentAccountInfo?.type === CONST_ACCOUNT_TYPES.Hardware;
  }

  @computed
  get currentAccountAddressShort() {
    return utilsApp.shortenAddress(this.currentAccountAddress || '');
  }

  @computed
  get accountsGroupFilter() {
    return storeStorage.accountsGroupFilter;
  }

  @action.bound
  setAccountsGroupFilterToChain({ chainKey }) {
    if (storeChain.chainsKeys.includes(chainKey)) {
      storeStorage.accountsGroupFilter = {
        type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.chain,
        chainKey,
      };
    }
  }

  getAccountTypeText(_type) {
    let type = _type;

    switch (_type) {
      case CONST_ACCOUNT_TYPES.Hardware:
      case WALLET_ACCOUNT_TYPES.HARDWARE: {
        type = '????????????';
        break;
      }

      case CONST_ACCOUNT_TYPES.WatchOnly:
      case WALLET_ACCOUNT_TYPES.WATCHED: {
        type = '????????????';
        break;
      }

      case CONST_ACCOUNT_TYPES.SingleChain:
      case WALLET_ACCOUNT_TYPES.IMPORTED: {
        type = '???????????????';
        break;
      }

      case CONST_ACCOUNT_TYPES.Wallet:
      case WALLET_ACCOUNT_TYPES.DEFAULT: {
        type = '????????????';
        break;
      }

      default: {
        type = '????????????';
      }
    }
    return type;
  }

  @computed
  get currentAccountTypeText() {
    return this.getAccountTypeText(this.currentAccountInfo?.type);
  }

  @action.bound
  setFirstChainKeyAsDefaultFilter() {
    if (!storeStorage.accountsGroupFilter.chainKey) {
      const data = {
        ...storeStorage.accountsGroupFilter,
        chainKey: storeChain.chainsKeys[0],
      };
      storeStorage.accountsGroupFilter = data;
    }
  }

  @computed
  get chainInfoOfAccountsGroup() {
    return storeChain.getChainInfoByKey(this.accountsGroupFilter.chainKey);
  }

  @computed
  get accountsListOfAccountsGroup() {
    const filter = this.accountsGroupFilter;
    if (filter.type === CONST_ACCOUNTS_GROUP_FILTER_TYPES.chain) {
      return this.getAccountsByChainKey(filter.chainKey);
    }

    if (filter.type === CONST_ACCOUNTS_GROUP_FILTER_TYPES.hardware) {
      return storeStorage.allAccountsRaw.filter(
        (acc) => acc.type === CONST_ACCOUNT_TYPES.Hardware,
      );
    }

    if (filter.type === CONST_ACCOUNTS_GROUP_FILTER_TYPES.wallet) {
      return storeStorage.allAccountsRaw.filter(
        (acc) => acc.type === CONST_ACCOUNT_TYPES.Wallet,
      );
    }
    return [];
  }

  @computed
  get accountsListOfCurrentChain() {
    return this.getAccountsByChainKey(storeChain.currentChainKey);
  }

  getAccountsByChainKey(chainKey) {
    if (!chainKey) {
      return [];
    }
    return storeStorage.allAccountsRaw
      .filter((acc) => acc.chainKey === chainKey)
      .filter((acc) => {
        if (storeApp.isHardwareOnlyMode) {
          return acc.type === CONST_ACCOUNT_TYPES.Hardware;
        }
        return true;
      });
  }

  addAccounts(accounts = []) {
    // TODO auto generate account name here
    storeStorage.allAccountsRaw = uniqBy(
      [...storeStorage.allAccountsRaw, ...accounts],
      (item) => item.chainKey + item.address,
    );
  }

  @action.bound
  changeAccountName(newName) {
    this.currentAccountInfo.name = newName;
    storeStorage.currentAccountRaw = {
      ...storeStorage.currentAccountRaw,
      name: newName,
    };
    const index = findIndex(storeStorage.allAccountsRaw, (e) => {
      return (
        e.address === this.currentAccountInfo.address &&
        e.chainKey === this.currentAccountInfo.chainKey
      );
    });

    if (index >= 0) {
      storeStorage.allAccountsRaw[index] = {
        ...storeStorage.currentAccountRaw,
      };
    }
  }

  canCurrentAccountDelete() {
    if (this.currentAccountInfo?.type !== CONST_ACCOUNT_TYPES.Wallet) {
      return true;
    }
    return (
      storeStorage.allAccountsRaw.filter(
        (item) =>
          item.chainKey === storeChain.currentChainKey &&
          item.type === CONST_ACCOUNT_TYPES.Wallet,
      ).length > 1
    );
  }

  @action.bound
  deleteAccountByAddress(address) {
    const curAddress = this.currentAccountAddress;
    const remains = storeStorage.allAccountsRaw.filter(
      (e) =>
        !(e.address === address && e.chainKey === storeChain.currentChainKey),
    );
    // todo delete all token???price???meta information
    if (address === curAddress) {
      const nextAccountOfSameChain = remains.find(
        (item) => item.chainKey === storeChain.currentChainKey,
      );
      const currentAccount = nextAccountOfSameChain || remains[0];
      if (currentAccount) {
        this.setCurrentAccount({ account: currentAccount });
      } else {
        this.clearCurrentAccount();
      }
    }

    storeStorage.allAccountsRaw = [...remains].filter(Boolean);
  }

  @action.bound
  clearCurrentAccount() {
    storeStorage.currentAccountRaw = storeStorage.CURRENT_ACCOUNT_RAW_DEFAULT;
  }

  @action.bound
  setCurrentAccount({ account }) {
    if (!account || !account?.chainKey) {
      this.clearCurrentAccount();
      return;
    }
    storeChain.setCurrentChainKey(account.chainKey);
    const baseChain = storeChain.currentBaseChain;
    storeStorage.currentAccountRaw = {
      ...account,
      baseChain: account?.baseChain ?? baseChain,
    };
  }

  // ui -> actions.js
  // -> setCompletedOnboarding()
  // -> initDefaultAccountOfNewApp()
  // -> storeAccount.initFirstAccount()
  @action.bound
  async initFirstAccount() {
    const getAccountsInCurrentChain = () =>
      this.getAccountsByChainKey(storeChain.currentChainKey);

    const accounts = getAccountsInCurrentChain();
    const noAccountsExists = accounts.length === 0;
    const chainKeyNotMatched =
      this.currentAccountChainKey !== storeChain.currentChainKey;

    if (noAccountsExists && this.currentAccountInfo) {
      this.clearCurrentAccount();
    }

    if (chainKeyNotMatched || !this.currentAccountChainKey) {
      this.clearCurrentAccount();
    }

    if (
      storeApp.isHardwareOnlyMode &&
      this.currentAccountInfo?.type !== CONST_ACCOUNT_TYPES.Hardware
    ) {
      this.clearCurrentAccount();
    }

    // create first account
    if (noAccountsExists && !storeApp.isHardwareOnlyMode) {
      const chainInfo = storeChain.currentChainInfo;
      const _wallet = walletFactory.createWallet({
        chainInfo,
        accountInfo: new OneAccountInfo({
          type: CONST_ACCOUNT_TYPES.Wallet,
        }),
      });
      const addresses = await _wallet.getAddresses({
        indexes: [0],
      });
      addresses[0].name = _wallet.chainInfo.generateAccountName({
        index: accounts.length + 1,
      });
      this.addAccounts(addresses);
    }

    if (!this.currentAccountInfo || chainKeyNotMatched) {
      const _accounts = getAccountsInCurrentChain();
      this.setCurrentAccount({ account: _accounts[0] });
    }
  }

  // storeAccount.autofixMismatchAddresses();
  @action.bound
  async _fixAccountAddress(account = {}) {
    const accountNew = { ...account };
    if (!accountNew.chainKey) {
      return null;
    }
    const chainInfo = storeChain.getChainInfoByKey(accountNew.chainKey);
    if (!chainInfo) {
      return null;
    }
    const wallet = walletFactory.createWallet({
      chainInfo,
      accountInfo: new OneAccountInfo(accountNew),
    });
    if (accountNew.type === CONST_ACCOUNT_TYPES.Wallet) {
      // TODO use path query addresses, as index is not saved in storage
      //    wallet.getAccountAddress();  return real address, not storage cache
      const addresses = await wallet.getAddresses({
        hdPaths: [accountNew.path],
      });
      const addressReal = addresses?.[0]?.address || '';
      if (addressReal !== accountNew.address) {
        console.error(
          `mismatch address: [ ${addressReal} ] | [ ${accountNew.address} ]`,
        );
        // rewrite correct address
        accountNew.address = addressReal || 'ErrorAddress';
        accountNew.baseChain = accountNew.baseChain || chainInfo.baseChain;
        return accountNew;
      }
    }
    return null;
  }

  @action.bound
  async autofixMismatchAddresses() {
    const currentAccountRawFixed = await this._fixAccountAddress(
      storeStorage.currentAccountRaw,
    );
    if (currentAccountRawFixed) {
      storeStorage.currentAccountRaw = currentAccountRawFixed;
    }

    // ----------------------------------------------
    let updated = false;
    const allAccountsRawFixed = [];
    for (let i = 0; i < storeStorage.allAccountsRaw.length; i++) {
      const account = storeStorage.allAccountsRaw[i];
      const accountFixed = await this._fixAccountAddress(account);
      if (accountFixed) {
        updated = true;
      }
      allAccountsRawFixed.push(accountFixed || account);
    }

    if (updated) {
      storeStorage.allAccountsRaw = allAccountsRawFixed;
    }
  }
}

global._storeAccount = new StoreAccount();
export default global._storeAccount;
