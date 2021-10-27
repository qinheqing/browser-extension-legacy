/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import uiDappApproval from '../wallets/dapp/uiDappApproval';
import utilsApp from '../utils/utilsApp';
import BaseStore from './BaseStore';
import storeApp from './storeApp';
import storeChain from './storeChain';
import storeAccount from './storeAccount';
import storeStorage from './storeStorage';
import createAutoRun from './createAutoRun';

class StoreDappNotify extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
    this.setupAutorun();
  }

  async setupAutorun() {
    // onChainChanged
    createAutoRun(
      () => {
        uiDappApproval.onChainChanged();
      },
      () => {
        const chainKey = storeChain.currentChainKey;
        const baseChain = storeChain.currentBaseChain;
        const { homeType } = storeApp;
      },
    )();

    // onAccountsChanged
    createAutoRun(
      () => {
        const address = storeAccount.currentAccountAddress;
        uiDappApproval.onAccountsChanged({
          address,
          _memo: 'StoreDappNotify.onAccountsChanged',
        });
      },
      () => {
        const chainKey = storeChain.currentChainKey;
        const { isUnlocked } = storeApp;
        const { homeType } = storeApp;
        const address = storeAccount.currentAccountAddress;
      },
    )();

    // onUnlockedChanged
    createAutoRun(
      () => {
        const { isUnlocked } = storeApp;
        uiDappApproval.onUnlockedChanged({ isUnlocked });
      },
      () => {
        const { isUnlocked } = storeApp;
      },
    )();
  }
}

global._storeDappNotify = new StoreDappNotify();
export default global._storeDappNotify;
