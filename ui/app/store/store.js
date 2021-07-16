import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'remote-redux-devtools';
import rootReducer from '../ducks';

export default function configureStore(initialState) {
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
    composeEnhancers(applyMiddleware(thunkMiddleware)),
  );
}
