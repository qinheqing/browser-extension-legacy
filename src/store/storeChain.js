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
import BaseStore from './BaseStore';

function createBuiltInChains() {
  const chainsRaw = [
    {
      key: CONST_CHAIN_KEYS.SOL_TEST_NET,
      name: 'SOL Testnet',
      baseChain: CONST_CHAIN_KEYS.SOL,
      currency: CONST_SOL,
      etherChainId: null,
      rpc: ['https://api.testnet.solana.com'],
      browser: ['https://solanascan.io/?testnet'],
      isTestNet: true,
    },
    {
      key: CONST_CHAIN_KEYS.BTC,
      name: 'BTC',
      baseChain: CONST_CHAIN_KEYS.BTC,
      currency: CONST_BTC,
      etherChainId: null,
      rpc: ['https://btc.com/'],
      browser: ['https://btc.com/'],
      isTestNet: false,
    },
    {
      key: CONST_CHAIN_KEYS.BSC,
      name: 'BSC',
      baseChain: CONST_CHAIN_KEYS.ETH,
      currency: CONST_BNB,
      etherChainId: 56,
      rpc: [
        'https://bsc-dataseed.binance.org/',
        'https://bsc-dataseed1.defibit.io/',
      ],
      browser: ['https://bscscan.com/'],
      isTestNet: false,
    },
    {
      key: CONST_CHAIN_KEYS.BSC_TEST_NET,
      name: 'BSC Testnet',
      baseChain: CONST_CHAIN_KEYS.ETH,
      currency: CONST_BNB,
      etherChainId: 97,
      rpc: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
      browser: ['https://testnet.bscscan.com/'],
      isTestNet: true,
    },
    {
      key: CONST_CHAIN_KEYS.SOL,
      name: 'SOL',
      baseChain: CONST_CHAIN_KEYS.SOL,
      currency: CONST_SOL,
      etherChainId: null,
      rpc: ['https://solana-api.projectserum.com'],
      browser: ['https://solanascan.io/'],
      isTestNet: false,
    },
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
      etherChainId: 3,
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
