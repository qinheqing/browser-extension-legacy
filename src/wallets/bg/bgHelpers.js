import { getAutoSaveStorageItem } from '../../store/BaseStore';

function isAtNewApp() {
  return (
    getAutoSaveStorageItem({
      name: 'StoreApp',
      field: 'homeType',
    }) === 'NEW'
  );
}

export default {
  isAtNewApp,
};
