import { getAutoSaveStorageItem } from '../../store/BaseStore';

function isAtNewApp() {
  return getAutoSaveStorageItem('homeType') === 'NEW';
}

export default {
  isAtNewApp,
};
