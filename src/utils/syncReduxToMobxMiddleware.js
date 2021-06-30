const syncReduxToMobxMiddleware = (store) => (next) => (action) => {
  // console.log('dispatching', action);

  // eslint-disable-next-line node/callback-return
  const result = next(action);

  // const newState = store.getState();
  // console.log('next state', newState);
  // console.log('isUnlocked', newState.metamask.isUnlocked);

  return result;
};
export default syncReduxToMobxMiddleware;
