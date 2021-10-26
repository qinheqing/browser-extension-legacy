import { autorun, untracked } from 'mobx';
import utilsApp from '../utils/utilsApp';
import storeStorage from './storeStorage';
import storeApp from './storeApp';

//  createAutoRun(()=>{},()=>{})();
function createAutoRun(
  callback,
  deps,
  {
    storageReadyRequired = true,
    metamaskStateReadyRequired = true,
    initializedRequired = true, // onBoarding done
    unlockedRequired = false,
  } = {},
) {
  return () => {
    const dispose = autorun(() => {
      utilsApp.ensureUiEnvironment();

      if (storageReadyRequired) {
        const d1 = storeStorage.storageReady;
      }

      if (metamaskStateReadyRequired) {
        const d2 = storeApp.metamaskStateReady;
      }

      if (initializedRequired) {
        const d3 = storeApp.isInitialized;
      }

      if (unlockedRequired) {
        const d4 = storeApp.isUnlocked;
      }

      deps();

      untracked(() => {
        let canRun = true;
        if (storageReadyRequired) {
          canRun = canRun && storeStorage.storageReady;
        }

        if (metamaskStateReadyRequired) {
          canRun = canRun && storeApp.metamaskStateReady;
        }

        if (initializedRequired) {
          canRun = canRun && storeApp.isInitialized;
        }

        if (unlockedRequired) {
          canRun = canRun && storeApp.isUnlocked;
        }

        if (canRun) {
          // eslint-disable-next-line node/callback-return
          callback();
        }
      });
    });
    return dispose;
  };
}

export default createAutoRun;
