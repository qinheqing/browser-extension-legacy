/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { isNil } from 'lodash';
import {
  CONST_ACCOUNTS_GROUP_FILTER_TYPES,
  CONST_CHAIN_KEYS,
  CONSTS_ACCOUNT_TYPES,
} from '../consts/consts';
import utilsStorage from '../utils/utilsStorage';
import BaseStore, { buildAutoSaveStorageKey } from './BaseStore';

// TODO move all autosave() fields to this store, so that we can migrate data clearly
class StoreStorage extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    this.autosave('allAccountsRaw');
    this.autosave('currentAccountRaw');
    this.autosave('currentChainKey');
    this.autosave('accountsGroupFilter');
    this.autosave('pendingTxid');
    this.autosave('currentTokensRaw');
    this.autosave('tokenMetasRaw');
    // TODO rename allBalanceRaw
    this.autosave('currentBalanceRaw');
    this.autosave('homeType');
    this.autosave('chainsCustomRaw');
    this.autosave('chainsSortKeys');
    this.autosave('pricesMapRaw');
    this.autosave('maskAssetBalance');
  }

  // TODO move to extension chrome.storage.local store, and save to single place
  // TODO make autosave to decorator
  // TODO data migrate implement
  autosave(storeProp) {
    // eslint-disable-next-line consistent-this
    const store = this;
    // TODO  this will have some problem, when code change, save key will change
    const storageKey = buildAutoSaveStorageKey(storeProp);
    // * init from localStorage
    const value = utilsStorage.getItem(storageKey);
    if (!isNil(value)) {
      store[storeProp] = value;
    }

    // * watch value change, auto save to localStorage
    autorun(() => {
      const watchValue = store[storeProp];
      // TODO requestAnimationFrame + throttle optimize
      utilsStorage.setItem(storageKey, watchValue);
    });
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

  @observable
  currentChainKey = null;

  // TODO add this to url query, because popup open new window will lost this params
  @observable
  accountsGroupFilter = {
    type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.chain,
    chainKey: null,
  };

  @observable
  pendingTxid = [
    // txid, txid, txid
  ];

  // TODO custom token added by user (ETH)
  @observable
  currentTokensRaw = {
    ownerAddress: '',
    tokens: [],
  };

  @observable
  tokenMetasRaw = {
    // chainKey-contract : {}
  };

  @observable
  currentBalanceRaw = {
    // TODO move decimals to AccountInfo and TokenInfo
    // key: { balance, decimals, lastUpdate }
  };

  // TODO showUserConfirmation show MM approve popup
  //      check homeType and return mock chainId=-1 address='1111'
  @observable
  homeType = 'OLD'; // NEW, OLD

  @observable
  maskAssetBalance = false;

  @observable
  chainsCustomRaw = {
    // chainKey: { ...OneChainInfo }
  };

  @observable
  chainsSortKeys = [
    CONST_CHAIN_KEYS.BSC,
    CONST_CHAIN_KEYS.BSC_TEST_NET,
    CONST_CHAIN_KEYS.SOL,
    CONST_CHAIN_KEYS.SOL_TEST_NET,
  ];

  @observable.ref
  pricesMapRaw = {};
}

global._storeStorage = new StoreStorage();
export default global._storeStorage;
