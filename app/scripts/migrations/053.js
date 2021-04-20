import { cloneDeep } from 'lodash';
import { NETWORK_TYPE_TO_ID_MAP } from '../../../shared/constants/network';

const version = 53;

/**
 * Set the chainId in the Network Controller provider data for all infura networks
 */
export default {
  version,
  async migrate(originalVersionedData) {
    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    const state = versionedData.data;
    versionedData.data = transformState(state);
    return versionedData;
  },
};

function transformState(state) {
  if (state.PreferencesController) {
    state.PreferencesController.accountTokens = {};
    state.PreferencesController.accountHiddenTokens = {};
  }
  return state;
}
