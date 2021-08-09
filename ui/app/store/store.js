import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'remote-redux-devtools';
import rootReducer from '../ducks';
import syncReduxToMobxMiddleware from '../../../src/utils/syncReduxToMobxMiddleware';

export default function configureStore(initialState) {
  // ERROR:  WebSocket connection to 'ws://localhost:8000/socketcluster/' failed
  //    1. process.env.ENV_REDUX_DEVTOOLS_ON = true
  //    2. start redux devtools ws server:
  //          yarn devtools:redux
  //    3. chrome redux devtools extension
  //        => Open Remote DevTools
  //        => Settings
  //        => Use custom (local) Server
  const composeEnhancers = process.env.ENV_REDUX_DEVTOOLS_ON
    ? composeWithDevTools({
        name: 'MetaMask',
        hostname: 'localhost',
        port: 8000,
        realtime: Boolean(process.env.METAMASK_DEBUG),
      })
    : compose;
  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(thunkMiddleware, syncReduxToMobxMiddleware),
    ),
  );
}
