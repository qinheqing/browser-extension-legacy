import './log/logger';
import storeDappNotify from './store/storeDappNotify';

function appBootstrap() {
  // do something on start
  global.$ok_storeDappNotify = storeDappNotify;
}

export default appBootstrap;
