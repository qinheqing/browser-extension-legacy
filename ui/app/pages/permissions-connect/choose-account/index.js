import { connect } from 'react-redux';
import { getMetaMaskKeyrings } from '../../../selectors';
import ChooseAccount from './choose-account.component';

const mapStateToProps = (state) => {
  const { hwOnlyMode } = state.metamask;

  return {
    hwOnlyMode,
    keyrings: getMetaMaskKeyrings(state),
  };
};

export default connect(mapStateToProps)(ChooseAccount);
