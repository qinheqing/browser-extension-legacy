import { getAutoSaveLocalStorageItem } from '../../store/BaseStore';

function isAtNewApp() {
  return getAutoSaveLocalStorageItem('homeType') === 'NEW';
}

export default {
  isAtNewApp,
};
