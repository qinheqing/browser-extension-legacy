/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import BaseStore from './BaseStore';
import storeStorage from './storeStorage';

class StoreTx extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  @action.bound
  addPendingTx(txid) {
    storeStorage.currentPendingTxid.unshift(txid);
  }

  @action.bound
  filterPendingTxConfirmed(confirmedTxList) {
    storeStorage.currentPendingTxid = storeStorage.currentPendingTxid.filter(
      (txid) => {
        return !confirmedTxList.find((confirmTx) => {
          const confirmId = confirmTx?.transaction?.signatures?.[0];
          return confirmId === txid;
        });
      },
    );
  }

  @action.bound
  clearPendingTx() {
    storeStorage.currentPendingTxid = [];
  }
}

global._storeTx = new StoreTx();
export default global._storeTx;
