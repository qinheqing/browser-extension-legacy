/* eslint import/no-cycle: "error" */
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
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../ui/app/helpers/constants/common';
import BaseStore from './BaseStore';
import storeStorage from './storeStorage';

// TODO use https://github.com/OneKeyHQ/remote-config
function createBuiltInChains() {
  let chainsRaw = [
    chainsConfig.SOL,
    // chainsConfig.BTC,
    // chainsConfig.BSC,
  ];
  if (IS_ENV_IN_TEST_OR_DEBUG) {
    chainsRaw = [
      ...chainsRaw,
      chainsConfig.SOL_TEST,
      // chainsConfig.BSC_TEST,
    ];
  }
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

    this.setFirstChainKeyAsDefault();
  }

  get chainsBuiltIn() {
    return createBuiltInChains();
  }

  @computed
  get chains() {
    const chainsCustom = Object.entries(storeStorage.chainsCustomRaw).reduce(
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

  @computed
  get chainsKeys() {
    return sortBy(Object.keys(this.chains), (item) => {
      return storeStorage.chainsSortKeys.indexOf(item.key);
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
    storeStorage.chainsCustomRaw[infoJson.key] = infoJson;
  }

  removeCustomChain(key) {
    delete storeStorage.chainsCustomRaw[key];
    // TODO remove accounts && remove tx && remove price
  }

  @action.bound
  setCurrentChainKey(key) {
    if (key) {
      storeStorage.currentChainKey = key;
    }
  }

  @action.bound
  setFirstChainKeyAsDefault() {
    if (!this.currentChainKey) {
      this.setCurrentChainKey(this.chainsKeys[0]);
    }
  }

  getChainInfoByKey(key) {
    return this.chains[key];
  }

  @computed
  get currentChainKey() {
    return storeStorage.currentChainKey;
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
