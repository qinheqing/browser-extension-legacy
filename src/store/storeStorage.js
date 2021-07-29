/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
  toJS,
} from 'mobx';
import { isNil } from 'lodash';
import {
  CONST_ACCOUNTS_GROUP_FILTER_TYPES,
  CONST_CHAIN_KEYS,
  CONSTS_ACCOUNT_TYPES,
} from '../consts/consts';
import utilsStorage from '../utils/utilsStorage';
import ExtensionStore from '../../app/scripts/lib/local-store';
import BaseStore from './BaseStore';

class StoreStorage extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    Promise.all([
      // homeType should be sync loaded, check utilsApp.isNewHome();
      this.autosave('homeType', { useLocalStorage: true }),
      this.autosave('maskAssetBalance'),

      this.autosave('currentAccountRaw'),
      this.autosave('currentChainKey'),
      this.autosave('currentTokensRaw'),
      this.autosave('currentPendingTxid'),

      this.autosave('accountsGroupFilter'),
      this.autosave('allAccountsRaw'),

      this.autosave('tokenMetasRaw'),
      this.autosave('tokenBalancesRaw'),
      this.autosave('tokenPricesRaw'),

      this.autosave('chainsCustomRaw'),
      this.autosave('chainsSortKeys'),
    ]).then(() => {
      this.storageReady = true;
    });
  }

  // true: localStorage
  // false: extensionStorage
  useLocalStorage = false;

  extStorage = new ExtensionStore();

  async getStorageItemAsync(
    key,
    { useLocalStorage = this.useLocalStorage } = {},
  ) {
    if (useLocalStorage) {
      return utilsStorage.getItem(key);
    }
    return (await this.extStorage.get([key]))?.[key];
  }

  async setStorageItemAsync(
    key,
    value,
    { useLocalStorage = this.useLocalStorage } = {},
  ) {
    if (useLocalStorage) {
      utilsStorage.setItem(key, value);
    }
    return this.extStorage.set({
      [key]: value,
    });
  }

  createAutoRunHook({ store, storeProp, storageKey, useLocalStorage }) {
    autorun(() => {
      const watchValue = store[storeProp];
      // keep this outside untracked(), otherwise deep object will not trigger autorun
      const plainValue = toJS(watchValue);

      untracked(() => {
        if (storeProp === 'allAccountsRaw') {
          // debugger;
        }
        // TODO requestAnimationFrame + throttle optimize
        this.setStorageItemAsync(storageKey, plainValue, { useLocalStorage });
      });
    });
  }

  // TODO make autosave to decorator
  // TODO data migrate implement
  async autosave(storeProp, { useLocalStorage } = {}) {
    // eslint-disable-next-line consistent-this
    const store = this;
    const storageKey = utilsStorage.buildAutoSaveStorageKey(storeProp);

    // * init from localStorage
    const value = await this.getStorageItemAsync(storageKey, {
      useLocalStorage,
    });

    // load storage data async delay simulate
    // await utilsApp.delay(5000);

    if (storeProp === 'allAccountsRaw') {
      // debugger;
    }
    if (!isNil(value)) {
      store[storeProp] = value;
    }

    // * watch value change, auto save to localStorage
    this.createAutoRunHook({ store, storeProp, storageKey, useLocalStorage });
  }

  @observable
  storageReady = false; // DO NOT autosave this field

  // Why array but NOT object?
  //      because PageWalletSelect should group accounts by chain\hardware\wallet
  //      so array is more convenience
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
  currentPendingTxid = [
    // txid, txid, txid
  ];

  // TODO custom token added by user (ETH)
  @observable
  currentTokensRaw = {
    chainKey: '',
    ownerAddress: '',
    tokens: [],
  };

  @observable
  tokenMetasRaw = {
    // chainKey-contract : {}
  };

  @observable
  tokenBalancesRaw = {
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
  tokenPricesRaw = {};
}

global._storeStorage = new StoreStorage();
export default global._storeStorage;
