import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import BaseStore from './BaseStore';

class StoreSample extends BaseStore {
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

global._storeSample = new StoreSample();
export default global._storeSample;
