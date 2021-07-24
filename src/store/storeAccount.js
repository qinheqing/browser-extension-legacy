/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { uniqBy } from 'lodash';
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
      case CONSTS_ACCOUNT_TYPES.Observer: {
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
      storeStorage.accountsGroupFilter = {
        ...storeStorage.accountsGroupFilter,
        chainKey: storeChain.chainsKeys[0],
      };
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
    // TODO auto generate account name
    storeStorage.allAccountsRaw = uniqBy(
      [...storeStorage.allAccountsRaw, ...accounts],
      (item) => item.chainKey + item.address,
    );
  }

  @action.bound
  setCurrentAccount({ account }) {
    storeStorage.currentAccountRaw = account;
  }
}

global._storeAccount = new StoreAccount();
export default global._storeAccount;
