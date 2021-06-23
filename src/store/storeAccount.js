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
import BaseStore from './BaseStore';
import storeChain from './storeChain';

class StoreAccount extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    this.autosave('allAccountsRaw');
    this.autosave('currentAccount');

    autorun(() => {
      const { currentAccount } = this;
      untracked(() => {
        storeChain.currentChainKey = currentAccount.chainKey;
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
  currentAccount = {
    chainKey: '',
    id: '',
    type: CONSTS_ACCOUNT_TYPES.Hardware,
    name: '',
    address: '',
    path: '',
  };

  @observable
  accountsGroupFilter = {
    type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.chain,
    chainKey: CONST_CHAIN_KEYS.ETH,
  };

  @computed
  get currentAccountsList() {
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
    this.currentAccount = account;
  }
}

global._storeAccount = new StoreAccount();
export default global._storeAccount;
