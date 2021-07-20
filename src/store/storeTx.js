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
    storeStorage.pendingTxid.unshift(txid);
  }

  @action.bound
  filterPendingTxConfirmed(confirmedTxList) {
    storeStorage.pendingTxid = storeStorage.pendingTxid.filter((txid) => {
      return !confirmedTxList.find((confirmTx) => {
        const confirmId = confirmTx?.transaction?.signatures?.[0];
        return confirmId === txid;
      });
    });
  }

  @action.bound
  clearPendingTx() {
    storeStorage.pendingTxid = [];
  }
}

global._storeTx = new StoreTx();
export default global._storeTx;
