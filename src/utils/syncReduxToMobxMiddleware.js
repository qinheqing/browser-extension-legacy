import storeApp from '../store/storeApp';

const syncReduxToMobxMiddleware = (store) => (next) => (action) => {
  // console.log('dispatching', action);

  // eslint-disable-next-line node/callback-return
  const result = next(action);
  const newState = store.getState();

  // console.log('Redux action dispatch: ', action, newState);

  if (newState.metamask) {
    const {
      isUnlocked,
      isInitialized,
      selectedAddress,
      hwOnlyMode,
      currentCurrency,
    } = newState.metamask;
    // TODO optimize
    storeApp.legacyState = {
      isUnlocked,
      isInitialized,
      selectedAddress,
      hwOnlyMode,
      currentCurrency,
    };
    storeApp.metamaskStateReady = true;
  }

  return result;
};
export default syncReduxToMobxMiddleware;
