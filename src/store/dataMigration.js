import { sortBy, range } from 'lodash';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../ui/app/helpers/constants/common';

const isUpdateFromOldVersion = Boolean(
  localStorage.getItem('onekey/autosave.storage.homeType'),
);
console.log(`========= isUpdateFromOldVersion: ${isUpdateFromOldVersion}`);

const CURRENT_DATA_VERSION = 0;

const migrations = {
  1: async (storage) => {
    const { currentAccountRaw } = storage;
    currentAccountRaw.name += '-1111';
    return storage;
  },
  2: async (storage) => {
    const { currentAccountRaw } = storage;
    currentAccountRaw.name += '-2222';
    return storage;
  },
  3: async (storage) => {
    const { currentAccountRaw } = storage;
    currentAccountRaw.name += '-3333';
    return storage;
  },
};

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

function checkMigrations() {
  const versions = range(1, CURRENT_DATA_VERSION + 1);
  versions.forEach((version) => {
    if (!migrations[version]) {
      throw new Error(`version=${version} migration function NOT found`);
    }
  });
}

async function doMigration({ storage, from, to }) {
  let storageTmp = storage;
  for (let i = from + 1; i <= to; i++) {
    const migrationFunc = migrations[i];
    if (migrationFunc) {
      const oldVersion = storageTmp.dataVersion;
      storageTmp = await migrationFunc(storageTmp);
      storageTmp.dataVersion = i;
      console.log(`========= migrate to version: ${oldVersion} => ${i}`);
      if (IS_ENV_IN_TEST_OR_DEBUG) {
        await delay(1000);
      }
    }
  }
}

checkMigrations();

export default {
  doMigration,
  CURRENT_DATA_VERSION,
  isUpdateFromOldVersion,
};
