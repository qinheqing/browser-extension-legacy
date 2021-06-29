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
import BaseStore from './BaseStore';
import storeChain from './storeChain';

class StoreAccount extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    this.autosave('allAccountsRaw');
    this.autosave('currentAccountRaw');

    autorun(() => {
      const { currentAccount } = this;
      untracked(() => {
        if (currentAccount?.chainKey) {
          storeChain.setCurrentChainKey(currentAccount?.chainKey);
        }
      });
    });
  }

  // allAccounts
  // TODO auto clean data if chain has been deleted
  @observable
  allAccountsRaw = [
    // { chainKey, id, type, name, address, path }
  ];

  @observable
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
    });
  }

  @computed
  get currentAccountAddress() {
    return this.currentAccount?.address;
  }

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
