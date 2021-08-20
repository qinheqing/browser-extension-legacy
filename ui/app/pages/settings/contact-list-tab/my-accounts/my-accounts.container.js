import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { accountsWithSendEtherInfoSelector } from '../../../../selectors';
import { filterAccountsByHwOnly } from '../../../../helpers/utils/util';
import ViewContact from './my-accounts.component';

const mapStateToProps = (state) => {
  let myAccounts = accountsWithSendEtherInfoSelector(state);
  const { hwOnlyMode } = state.metamask;

  myAccounts = filterAccountsByHwOnly({
    accounts: myAccounts,
    hwOnlyMode,
  });

  return {
    myAccounts,
  };
};

export default compose(withRouter, connect(mapStateToProps))(ViewContact);
