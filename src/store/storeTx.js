import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import BaseStore from './BaseStore';

class StoreTx extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
    this.autosave('pendingTx');
  }

  @observable
  pendingTx = [
    // txid, txid, txid
  ];

  @action.bound
  addPendingTx(txid) {
    this.pendingTx.unshift(txid);
  }

  @action.bound
  filterPendingTxConfirmed(confirmedTxList) {
    this.pendingTx = this.pendingTx.filter((txid) => {
      return !confirmedTxList.find((confirmTx) => {
        const confirmId = confirmTx?.transaction?.signatures?.[0];
        return confirmId === txid;
      });
    });
  }

  @action.bound
  clearPendingTx() {
    this.pendingTx = [];
  }
}

global._storeTx = new StoreTx();
export default global._storeTx;
