import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {
  closeWelcomeScreen,
  setFirstTimeFlowType,
  setHwOnlyModeAsync,
} from '../../../store/actions';

import Welcome from './welcome.component';

const mapStateToProps = ({ metamask }) => {
  const { welcomeScreenSeen, participateInMetaMetrics, hwOnlyMode } = metamask;

  return {
    welcomeScreenSeen,
    participateInMetaMetrics,
    hwOnlyMode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeWelcomeScreen: () => dispatch(closeWelcomeScreen()),
    setFirstTimeFlowType: (type) => dispatch(setFirstTimeFlowType(type)),
    setHwOnlyModeAsync: (val) => dispatch(setHwOnlyModeAsync(val)),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Welcome);
