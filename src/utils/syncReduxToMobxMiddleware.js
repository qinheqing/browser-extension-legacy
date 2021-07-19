import storeApp from '../store/storeApp';

const syncReduxToMobxMiddleware = (store) => (next) => (action) => {
  // console.log('dispatching', action);

  // eslint-disable-next-line node/callback-return
  const result = next(action);

  const newState = store.getState();
  if (newState.metamask) {
    const { isUnlocked, selectedAddress, hwOnlyMode } = newState.metamask;
    // TODO optimize
    storeApp.legacyState = {
      isUnlocked,
      selectedAddress,
      hwOnlyMode,
    };
  }

  return result;
};
export default syncReduxToMobxMiddleware;
