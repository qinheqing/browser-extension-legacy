import { observable, computed, makeObservable, action } from 'mobx';
import { toPlainObject, sortBy } from 'lodash';
import OneChainInfo from '../classes/OneChainInfo';
import {
  CONST_ETH,
  CONST_BNB,
  CONST_SOL,
  CONST_CHAIN_KEYS,
  CONST_BTC,
} from '../consts/consts';
import utilsApp from '../utils/utilsApp';
import chainsConfig from '../config/chainsConfig';
import BaseStore from './BaseStore';

// TODO use https://github.com/OneKeyHQ/remote-config
function createBuiltInChains() {
  const chainsRaw = [
    chainsConfig.SOL,
    chainsConfig.SOL_TEST,
    // chainsConfig.BTC,
    // chainsConfig.BSC,
    // chainsConfig.BSC_TEST,
  ];
  return chainsRaw.reduce((prev, current) => {
    const info = new OneChainInfo(current);
    prev[info.key] = info;
    return prev;
  }, {});
}

class StoreChain extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    this.autosave('chainsCustomRaw');
    this.autosave('currentChainKey');
    this.autosave('chainsSortKeys');
  }

  get chainsBuiltIn() {
    return createBuiltInChains();
  }

  @observable
  chainsCustomRaw = {
    // chainKey: { ...OneChainInfo }
  };

  @computed
  get chains() {
    const chainsCustom = Object.entries(this.chainsCustomRaw).reduce(
      (prev, [key, item]) => {
        prev[key] = new OneChainInfo(item);
        return prev;
      },
      {},
    );
    return {
      ...this.chainsBuiltIn,
      ...chainsCustom,
    };
  }

  @observable
  chainsSortKeys = [
    CONST_CHAIN_KEYS.BSC,
    CONST_CHAIN_KEYS.BSC_TEST_NET,
    CONST_CHAIN_KEYS.SOL,
    CONST_CHAIN_KEYS.SOL_TEST_NET,
  ];

  @computed
  get chainsKeys() {
    return sortBy(Object.keys(this.chains), (item) => {
      return this.chainsSortKeys.indexOf(item.key);
    });
  }

  addChainTest() {
    const infura = process.env.INFURA_PROJECT_ID;
    const info = new OneChainInfo({
      baseChain: CONST_CHAIN_KEYS.ETH,
      key: `Ropsten@${utilsApp.uuid()}`,
      name: 'Ropsten Testnet',
      internalChainId: 3,
      rpc: [`https://ropsten.infura.io/v3/${infura}`],
      currency: CONST_ETH,
      browser: ['https://ropsten.etherscan.io/'],
      isCustom: true,
      isTestNet: true,
    });
    this.addCustomChain(info);
  }

  addCustomChain(info) {
    const infoJson = toPlainObject(info);
    infoJson.isCustom = true;
    this.chainsCustomRaw[infoJson.key] = infoJson;
  }

  removeCustomChain(key) {
    delete this.chainsCustomRaw[key];
    // TODO remove accounts && remove tx && remove price
  }

  @observable
  currentChainKey = this.chainsKeys[0];

  @action.bound
  setCurrentChainKey(key) {
    if (key) {
      this.currentChainKey = key;
    }
  }

  getChainInfoByKey(key) {
    return this.chains[key];
  }

  @computed
  get currentChainInfo() {
    return this.getChainInfoByKey(this.currentChainKey);
  }

  @computed
  get currentBaseChain() {
    return this.currentChainInfo?.baseChain;
  }
}

global._storeChain = new StoreChain();
export default global._storeChain;
