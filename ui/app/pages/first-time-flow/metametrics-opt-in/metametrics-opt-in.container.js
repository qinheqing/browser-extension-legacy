import { connect } from 'react-redux';
import { setParticipateInMetaMetrics } from '../../../store/actions';
import { getFirstTimeFlowTypeRoute } from '../../../selectors';
import { CONST_FIRST_TIME_FLOW_TYPES } from '../../../helpers/constants/common';
import MetaMetricsOptIn from './metametrics-opt-in.component';

const firstTimeFlowTypeNameMap = {
  [CONST_FIRST_TIME_FLOW_TYPES.CREATE]: 'Selected Create New Wallet',
  [CONST_FIRST_TIME_FLOW_TYPES.IMPORT]: 'Selected Import Wallet',
  [CONST_FIRST_TIME_FLOW_TYPES.CONNECT_HW]: 'Get Started as HW Only',
};

const mapStateToProps = (state) => {
  const { firstTimeFlowType, participateInMetaMetrics } = state.metamask;

  return {
    nextRoute: getFirstTimeFlowTypeRoute(state),
    firstTimeSelectionMetaMetricsName:
      firstTimeFlowTypeNameMap[firstTimeFlowType],
    participateInMetaMetrics,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setParticipateInMetaMetrics: (val) =>
      dispatch(setParticipateInMetaMetrics(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MetaMetricsOptIn);
