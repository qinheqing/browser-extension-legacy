import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import BaseStore from './BaseStore';

// TODO move all autosave() fields to this store, so that we can migrate data clearly
class StoreStorage extends BaseStore {
  constructor(props) {
    super(props);
    // auto detect fields decorators, and make them reactive
    makeObservable(this);
  }

  @observable
  hello = 'world';

  @computed
  get helloComputed() {
    return this.hello;
  }

  @action.bound
  setHello() {
    this.hello = 'world';
  }
}

global._storeStorage = new StoreStorage();
export default global._storeStorage;
