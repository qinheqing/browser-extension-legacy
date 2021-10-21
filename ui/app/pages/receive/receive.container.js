import { connect } from 'react-redux';
import { setAccountLabel, showModal } from '../../store/actions';
import {
  getSelectedIdentity,
  getRpcPrefsForCurrentProvider,
  getCurrentChainId,
} from '../../selectors';
import Receive from './receive.component';

const mapStateToProps = (state) => {
  return {
    network: state.metamask.network,
    chainId: getCurrentChainId(state),
    selectedIdentity: getSelectedIdentity(state),
    keyrings: state.metamask.keyrings,
    rpcPrefs: getRpcPrefsForCurrentProvider(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showExportPrivateKeyModal: () =>
      dispatch(showModal({ name: 'EXPORT_PRIVATE_KEY' })),
    setAccountLabel: (address, label) =>
      dispatch(setAccountLabel(address, label)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Receive);
