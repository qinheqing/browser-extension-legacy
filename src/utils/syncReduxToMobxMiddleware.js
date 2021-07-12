import storeApp from '../store/storeApp';

const syncReduxToMobxMiddleware = (store) => (next) => (action) => {
  // console.log('dispatching', action);

  // eslint-disable-next-line node/callback-return
  const result = next(action);

  const newState = store.getState();
  if (newState.metamask) {
    const { isUnlocked, selectedAddress } = newState.metamask;
    storeApp.legacyState = {
      isUnlocked,
      selectedAddress,
    };
  }

  return result;
};
export default syncReduxToMobxMiddleware;
