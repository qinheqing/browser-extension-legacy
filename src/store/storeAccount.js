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
  CONSTS_ACCOUNT_TYPES,
  CONST_ACCOUNTS_GROUP_FILTER_TYPES,
  CONST_CHAIN_KEYS,
} from '../consts/consts';
import OneAccountInfo from '../classes/OneAccountInfo';
import walletFactory from '../wallets/walletFactory';
import utilsApp from '../utils/utilsApp';
import BaseStore from './BaseStore';
import storeChain from './storeChain';
import storeWallet from './storeWallet';
import storeTx from './storeTx';
import storeStorage from './storeStorage';

class StoreAccount extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    this.setFirstChainKeyAsDefaultFilter();

    autorun(() => {
      const { currentAccountRaw } = storeStorage;
      untracked(() => {
        const { currentAccount } = this;
        if (currentAccount?.chainKey) {
          storeChain.setCurrentChainKey(currentAccount?.chainKey);
        }
        storeTx.clearPendingTx();
      });
    });

    // TODO do not use auto run to new Wallet, as currentAccount balance change will trigger this callback
    autorun(() => {
      const { currentAccountRaw } = storeStorage;
      const { currentBaseChain } = storeChain;
      untracked(() => {
        this.updateCurrentWallet();
      });
    });
  }

  updateCurrentWallet() {
    console.log('Create wallet instance');
    // TODO debounce
    const wallet = walletFactory.createWallet({
      chainInfo: storeChain.currentChainInfo,
      accountInfo: this.currentAccount,
    });
    storeWallet.setCurrentWallet(wallet);
  }

  @observable
  refreshKey = 1;

  // TODO rename to currentAccountInfo
  @computed
  get currentAccount() {
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
    return this.currentAccount?.address;
  }

  @computed
  get currentAccountChainKey() {
    return this.currentAccount?.chainKey;
  }

  @computed
  get currentAccountAddressShort() {
    return utilsApp.shortenAddress(this.currentAccountAddress || '');
  }

  @computed
  get accountsGroupFilter() {
    return storeStorage.accountsGroupFilter;
  }

  @computed
  get currentAccountTypeText() {
    let type;
    switch (this.currentAccount.type) {
      case CONSTS_ACCOUNT_TYPES.Hardware: {
        type = '硬件账户';
        break;
      }

      case CONSTS_ACCOUNT_TYPES.WatchOnly: {
        type = '观察账户';
        break;
      }

      case CONSTS_ACCOUNT_TYPES.SingleChain: {
        type = '单币种账户';
        break;
      }
      case CONSTS_ACCOUNT_TYPES.Wallet:
      default: {
        type = '钱包账户';
      }
    }
    return type;
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
        (acc) => acc.type === CONSTS_ACCOUNT_TYPES.Hardware,
      );
    }

    if (filter.type === CONST_ACCOUNTS_GROUP_FILTER_TYPES.wallet) {
      return storeStorage.allAccountsRaw.filter(
        (acc) => acc.type === CONSTS_ACCOUNT_TYPES.Wallet,
      );
    }
    return [];
  }

  getAccountsByChainKey(chainKey) {
    if (!chainKey) {
      return [];
    }
    return storeStorage.allAccountsRaw.filter(
      (acc) => acc.chainKey === chainKey,
    );
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
    this.currentAccount.name = newName;
    storeStorage.currentAccountRaw = {
      ...storeStorage.currentAccountRaw,
      name: newName,
    };
    const index = findIndex(storeStorage.allAccountsRaw, (e) => {
      return (
        e.address === this.currentAccount.address &&
        e.chainKey === this.currentAccount.chainKey
      );
    });

    if (index >= 0) {
      storeStorage.allAccountsRaw[index] = {
        ...storeStorage.currentAccountRaw,
      };
    }
  }

  @action.bound
  deleteAccountByAddress(address) {
    if (storeStorage.allAccountsRaw.length <= 1) {
      return;
    }
    const curAddress = this.currentAccountAddress;
    const remains = storeStorage.allAccountsRaw.filter(
      (e) =>
        !(e.address === address && e.chainKey === storeChain.currentChainKey),
    );
    // todo delete all token、price、meta information
    if (address === curAddress) {
      this.setCurrentAccount({ account: remains[0] });
    }

    if (remains.length >= 1) {
      storeStorage.allAccountsRaw = [...remains];
    }
  }

  @action.bound
  setCurrentAccount({ account }) {
    storeStorage.currentAccountRaw = { ...account };
  }

  @action.bound
  async initFirstAccount() {
    const getAccountsInCurrentChain = () =>
      this.getAccountsByChainKey(storeChain.currentChainKey);

    const accounts = getAccountsInCurrentChain();

    if (accounts.length === 0) {
      const chainInfo = storeChain.currentChainInfo;
      const _wallet = walletFactory.createWallet({
        chainInfo,
        accountInfo: new OneAccountInfo({
          type: CONSTS_ACCOUNT_TYPES.Wallet,
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

    if (!this.currentAccount) {
      const _accounts = getAccountsInCurrentChain();
      _accounts[0] && this.setCurrentAccount({ account: _accounts[0] });
    }
  }

  // storeAccount.autofixMismatchAddresses();
  @action.bound
  async _fixAccountAddress(account = {}) {
    const accountNew = account;
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
    if (accountNew.type === CONSTS_ACCOUNT_TYPES.Wallet) {
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
        return accountNew;
      }
    }
    return null;
  }

  @action.bound
  async autofixMismatchAddresses() {
    let updated = false;

    if (await this._fixAccountAddress(storeStorage.currentAccountRaw)) {
      updated = true;
    }

    for (let i = 0; i < storeStorage.allAccountsRaw.length; i++) {
      const account = storeStorage.allAccountsRaw[i];
      if (await this._fixAccountAddress(account)) {
        updated = true;
      }
    }

    if (updated) {
      storeStorage.currentAccountRaw = {
        ...storeStorage.currentAccountRaw,
      };
      storeStorage.allAccountsRaw = [...storeStorage.allAccountsRaw];
    }
  }
}

global._storeAccount = new StoreAccount();
export default global._storeAccount;
