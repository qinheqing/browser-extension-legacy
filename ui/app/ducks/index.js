import { combineReducers } from 'redux';
import { ALERT_TYPES } from '../../../shared/constants/alerts';
import metamaskReducer from './metamask/metamask';
import localeMessagesReducer from './locale/locale';
import sendReducer from './send/send.duck';
import appStateReducer from './app/app';
import confirmTransactionReducer from './confirm-transaction/confirm-transaction.duck';
import gasReducer from './gas/gas.duck';
import { invalidCustomNetwork, unconnectedAccount } from './alerts';
import historyReducer from './history/history';
import errorReducer from './errors/error';

export default combineReducers({
  [ALERT_TYPES.invalidCustomNetwork]: invalidCustomNetwork,
  [ALERT_TYPES.unconnectedAccount]: unconnectedAccount,
  activeTab: (s) => (s === undefined ? null : s),
  error: errorReducer,
  metamask: metamaskReducer,
  appState: appStateReducer,
  history: historyReducer,
  send: sendReducer,
  confirmTransaction: confirmTransactionReducer,
  gas: gasReducer,
  localeMessages: localeMessagesReducer,
});
