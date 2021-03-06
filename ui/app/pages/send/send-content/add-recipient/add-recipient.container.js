import { connect } from 'react-redux';
import {
  getSendEnsResolution,
  getSendEnsResolutionError,
  accountsWithSendEtherInfoSelector,
  getAddressBook,
  getAddressBookEntry,
} from '../../../../selectors';

import { updateSendTo } from '../../../../store/actions';
import { filterAccountsByHwOnly } from '../../../../helpers/utils/util';
import AddRecipient from './add-recipient.component';

export default connect(mapStateToProps, mapDispatchToProps)(AddRecipient);

function mapStateToProps(state) {
  const ensResolution = getSendEnsResolution(state);
  const { hwOnlyMode } = state.metamask;

  let addressBookEntryName = '';
  if (ensResolution) {
    const addressBookEntry = getAddressBookEntry(state, ensResolution) || {};
    addressBookEntryName = addressBookEntry.name;
  }

  const addressBook = getAddressBook(state);

  let ownedAccounts = accountsWithSendEtherInfoSelector(state).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  ownedAccounts = filterAccountsByHwOnly({
    accounts: ownedAccounts,
    hwOnlyMode,
  });

  return {
    addressBook,
    addressBookEntryName,
    contacts: addressBook.filter(({ name }) => Boolean(name)),
    ensResolution,
    ensResolutionError: getSendEnsResolutionError(state),
    nonContacts: addressBook.filter(({ name }) => !name),
    ownedAccounts,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateSendTo: (to, nickname) => dispatch(updateSendTo(to, nickname)),
  };
}
