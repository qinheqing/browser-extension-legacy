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
import {
  CONST_ACCOUNTS_GROUP_FILTER_TYPES,
  CONST_CHAIN_KEYS,
  CONST_ACCOUNT_TYPES,
} from '../consts/consts';
import utilsStorage from '../utils/utilsStorage';
import BaseStoreWithStorage from './BaseStoreWithStorage';
import dataMigration from './dataMigration';

class StoreStorage extends BaseStoreWithStorage {
  constructor(props) {
    super(props);
    this.storageNamespace = utilsStorage.STORAGE_NAMESPACES.storage;
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    Promise.all([
      // homeType should be sync loaded, check utilsApp.isNewHome();
      this.autosave('homeType', { useLocalStorage: true }),
      this.autosave('maskAssetBalance'),
      this.autosave('dataVersion'),

      this.autosave('currentAccountRaw'),
      this.autosave('currentChainKey'),
      this.autosave('currentChainInfo'),
      this.autosave('currentTokensRaw'),
      this.autosave('currentPendingTxid'),

      this.autosave('accountsGroupFilter'),
      this.autosave('allPendingTxRaw'),
      this.autosave('allAccountsRaw'),

      this.autosave('accountLocalTokensRaw'),
      this.autosave('tokenMetasRaw'),
      this.autosave('tokenBalancesRaw'),
      this.autosave('tokenPricesRaw'),

      this.autosave('chainsCustomRaw'),
      this.autosave('chainsSortKeys'),
    ]).then(async () => {
      if (dataMigration.CURRENT_DATA_VERSION > this.dataVersion) {
        console.log(
          `need storage data migration: ${this.dataVersion} => ${dataMigration.CURRENT_DATA_VERSION}`,
        );

        await dataMigration.doMigration({
          storage: this,
          from: this.dataVersion,
          to: dataMigration.CURRENT_DATA_VERSION,
        });
      }
      // ensure Page Components mounting after storageReady
      this.storageReady = true;
    });
  }

  @observable.ref
  dataVersion = dataMigration.isUpdateFromOldVersion
    ? 0
    : dataMigration.CURRENT_DATA_VERSION;

  @observable.ref
  storageReady = false; // DO NOT autosave this field

  // Why array but NOT object?
  //      because PageWalletSelect should group accounts by chain\hardware\wallet
  //      so array is more convenience
  // TODO auto clean data if chain has been deleted
  @observable.ref
  allAccountsRaw = [
    // { chainKey, id, type, name, address, path }
  ];

  get CURRENT_ACCOUNT_RAW_DEFAULT() {
    return {
      baseChain: '',
      chainKey: '',
      id: '', // id missing
      type: CONST_ACCOUNT_TYPES.Hardware,
      name: '',
      address: '',
      path: '',
    };
  }

  @observable.ref
  currentAccountRaw = this.CURRENT_ACCOUNT_RAW_DEFAULT;

  @observable.ref
  currentChainKey = null;

  @observable.ref
  currentChainInfo = {};

  // TODO add this to url query, because popup open new window will lost this params
  @observable.ref
  accountsGroupFilter = {
    type: CONST_ACCOUNTS_GROUP_FILTER_TYPES.chain,
    chainKey: null,
  };

  @observable.ref
  currentPendingTxid = [
    // txid, txid, txid
  ];

  @observable.ref
  allPendingTxRaw = {};

  @observable.ref
  accountLocalTokensRaw = {
    // accountKey: { tokenContractAddress: { address } }
  };

  // TODO custom token added by user (ETH)
  @observable.ref
  currentTokensRaw = {
    chainKey: '',
    ownerAddress: '',
    tokens: [],
  };

  @observable.ref
  tokenMetasRaw = {
    // chainKey-contract : {}
  };

  @observable.ref
  tokenBalancesRaw = {
    // TODO move decimals to AccountInfo and TokenInfo
    // key: { balance, decimals, lastUpdate }
  };

  // TODO showUserConfirmation show MM approve popup
  //      check homeType and return mock chainId=-1 address='1111'
  @observable.ref
  homeType = 'OLD'; // NEW, OLD

  @observable.ref
  maskAssetBalance = false;

  @observable.ref
  chainsCustomRaw = {
    // chainKey: { ...OneChainInfo }
  };

  @observable.ref
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
