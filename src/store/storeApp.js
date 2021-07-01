import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import BaseStore from './BaseStore';

class StoreApp extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    this.autosave('homeType');
  }

  @observable
  homeType = 'NEW'; // NEW, OLD
}

global._storeApp = new StoreApp();
export default global._storeApp;
