/* eslint import/no-cycle: "error" */
import { observable, computed, makeObservable, action } from 'mobx';
import { toPlainObject, sortBy, cloneDeep } from 'lodash';
import OneChainInfo from '../classes/OneChainInfo';
import {
  CONST_ETH,
  CONST_BNB,
  CONST_SOL,
  CONST_CHAIN_KEYS,
  CONST_BTC,
} from '../consts/consts';
import utilsApp from '../utils/utilsApp';
import chains from '../config/chains';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../ui/app/helpers/constants/common';
import { allBuiltInChainsMap } from '../config/chains/allBuiltInChains';
import BaseStore from './BaseStore';
import storeStorage from './storeStorage';

class StoreChain extends BaseStore {
  constructor(props) {
    super(props);
    makeObservable(this);

    this.setFirstChainKeyAsDefault();
  }

  get chainsBuiltIn() {
    return allBuiltInChainsMap;
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
      tokenChainId: 3,
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
      const chainInfo = this.chains[key] || {};
      storeStorage.currentChainKey = key;
      storeStorage.currentChainInfo = cloneDeep(chainInfo);
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

  @computed
  get currentNativeTokenUnitName() {
    return this.currentChainInfo?.nativeToken?.unitName;
  }
}

global._storeChain = new StoreChain();
export default global._storeChain;
