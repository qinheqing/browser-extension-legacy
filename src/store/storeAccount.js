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
import BaseStore from './BaseStore';
import storeChain from './storeChain';
import storeWallet from './storeWallet';
import storeTx from './storeTx';

class StoreAccount extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    this.autosave('allAccountsRaw');
    this.autosave('currentAccountRaw');
    this.autosave('accountsGroupFilter');

    autorun(() => {
      const { currentAccountRaw } = this;
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
      const { currentAccountRaw } = this;
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

  // allAccounts
  // TODO auto clean data if chain has been deleted
  @observable
  allAccountsRaw = [
    // { chainKey, id, type, name, address, path }
  ];

  @observable.ref
  currentAccountRaw = {
    chainKey: '',
    id: '',
    type: CONSTS_ACCOUNT_TYPES.Hardware,
    name: '',
    address: '',
    path: '',
  };

  // TODO rename to currentAccountInfo
  @computed
  get currentAccount() {
    const { chainKey, address } = this.currentAccountRaw;
    if (!address || !chainKey) {
      return null;
    }
    const chainInfo = storeChain.getChainInfoByKey(chainKey);
    return new OneAccountInfo({
      ...this.currentAccountRaw,
      currency: chainInfo.currency,
      decimals: storeWallet.currentWallet.options.balanceDecimals, // TODO move to chainInfo
    });
  }

  @computed
  get currentAccountAddress() {
    return this.currentAccount?.address;
  }

  // TODO add this to url query, because popup open new window will lost this params
  @observable
  accountsGroupFilter = {
    type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.chain,
    chainKey: CONST_CHAIN_KEYS.SOL_TEST_NET,
  };

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
      return this.allAccountsRaw.filter(
        (acc) => acc.type === CONSTS_ACCOUNT_TYPES.Hardware,
      );
    }
    if (filter.type === CONST_ACCOUNTS_GROUP_FILTER_TYPES.wallet) {
      return this.allAccountsRaw.filter(
        (acc) => acc.type === CONSTS_ACCOUNT_TYPES.Wallet,
      );
    }
    return [];
  }

  getAccountsByChainKey(chainKey) {
    if (!chainKey) {
      return [];
    }
    return this.allAccountsRaw.filter((acc) => acc.chainKey === chainKey);
  }

  addAccounts(accounts = []) {
    // TODO auto generate account name
    this.allAccountsRaw = uniqBy(
      [...this.allAccountsRaw, ...accounts],
      (item) => item.chainKey + item.address,
    );
  }

  setCurrentAccount({ account }) {
    this.currentAccountRaw = account;
  }
}

global._storeAccount = new StoreAccount();
export default global._storeAccount;
