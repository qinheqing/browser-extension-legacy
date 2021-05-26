import { connect } from 'react-redux';
import CreateAccountPage from './create-account.component';

const mapStateToProps = (state) => {
  const { hwOnlyMode } = state.metamask;
  return {
    hwOnlyMode,
  };
};

export default connect(mapStateToProps)(CreateAccountPage);

// export { default } from './create-account.component';
