import { connect } from 'react-redux';
import {
  getSendTo,
  getSendToNickname,
  getAddressBookEntry,
  deprecatedGetCurrentNetworkId,
} from '../../../../selectors';
import EnsInput from './ens-input.component';

export default connect((state) => {
  const selectedAddress = getSendTo(state);
  return {
    network: deprecatedGetCurrentNetworkId(state),
    selectedAddress,
    selectedName: getSendToNickname(state),
    contact: getAddressBookEntry(state, selectedAddress),
  };
})(EnsInput);
