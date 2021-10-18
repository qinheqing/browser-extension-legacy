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

class StoreDappNotify extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
    this.setupAutorun();
  }

  async setupAutorun() {
    await utilsApp.waitForDataLoaded({
      log: 'StoreDappNotify.setupAutorun',
      data: [
        () => storeApp.metamaskStateReady,
        () => storeStorage.storageReady,
      ],
    });

    // onChainChanged
    autorun(() => {
      const chainKey = storeChain.currentChainKey;
      const baseChain = storeChain.currentBaseChain;
      const { homeType } = storeApp;
      untracked(() => {
        // noop
        uiDappApproval.onChainChanged();
      });
    });

    // onAccountsChanged
    autorun(() => {
      const chainKey = storeChain.currentChainKey;
      const { isUnlocked } = storeApp;
      const { homeType } = storeApp;
      const address = storeAccount.currentAccountAddress;
      untracked(() => {
        // noop
        uiDappApproval.onAccountsChanged({
          address,
          _memo: 'StoreDappNotify.onAccountsChanged',
        });
      });
    });

    // onUnlockedChanged
    autorun(() => {
      const { isUnlocked } = storeApp;
      untracked(() => {
        // noop
        uiDappApproval.onUnlockedChanged({ isUnlocked });
      });
    });
  }
}

global._storeDappNotify = new StoreDappNotify();
export default global._storeDappNotify;
