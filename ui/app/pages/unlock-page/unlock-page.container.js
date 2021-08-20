import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../../shared/constants/app';
import {
  DEFAULT_ROUTE,
  RESTORE_VAULT_ROUTE,
} from '../../helpers/constants/routes';
import {
  tryUnlockMetamask,
  forgotPassword,
  markPasswordForgotten,
  forceUpdateMetamaskState,
  showModal,
} from '../../store/actions';
import UnlockPage from './unlock-page.component';

const mapStateToProps = (state) => {
  const {
    metamask: { isUnlocked, hwOnlyMode },
  } = state;
  return {
    hwOnlyMode,
    isUnlocked,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    forgotPassword: () => dispatch(forgotPassword()),
    tryUnlockMetamask: (password) => dispatch(tryUnlockMetamask(password)),
    markPasswordForgotten: () => dispatch(markPasswordForgotten()),
    forceUpdateMetamaskState: () => forceUpdateMetamaskState(dispatch),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    // eslint-disable-next-line no-shadow
    markPasswordForgotten,
    // eslint-disable-next-line no-shadow
    tryUnlockMetamask,
    ...restDispatchProps
  } = dispatchProps;
  const { history, onSubmit: ownPropsSubmit, ...restOwnProps } = ownProps;

  const onImport = async () => {
    await markPasswordForgotten();
    history.push(RESTORE_VAULT_ROUTE);

    if (getEnvironmentType() === ENVIRONMENT_TYPE_POPUP) {
      global.platform.openExtensionInBrowser(RESTORE_VAULT_ROUTE);
    }
  };

  const onSubmit = async (password) => {
    await tryUnlockMetamask(password);
    let returnRoute = DEFAULT_ROUTE;
    if (history?.location?.state?.returnRoute) {
      returnRoute = history?.location?.state?.returnRoute;
    }
    history.push(returnRoute);
  };

  return {
    ...stateProps,
    ...restDispatchProps,
    ...restOwnProps,
    onImport,
    onRestore: onImport,
    onSubmit: ownPropsSubmit || onSubmit,
    history,
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
)(UnlockPage);
