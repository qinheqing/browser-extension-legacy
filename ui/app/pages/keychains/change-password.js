import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  createNewVaultAndRestore,
  getBackgroundInstanceAsync,
  unMarkPasswordForgotten,
} from '../../store/actions';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import TextField from '../../components/ui/text-field';
import Button from '../../components/ui/button';
import utilsToast from '../../../../src/utils/utilsToast';

class ChangePasswordPage extends Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    createNewVaultAndRestore: PropTypes.func.isRequired,
    leaveImportSeedScreenState: PropTypes.func,
    history: PropTypes.object,
    isLoading: PropTypes.bool,
  };

  state = {
    oldPassword: '',
    password: '',
    confirmPassword: '',
    oldPasswordError: null,
    passwordError: null,
    confirmPasswordError: null,
  };

  handleOldPasswordChange(oldPassword) {
    let oldPasswordError = null;

    if (oldPassword && oldPassword.length < 8) {
      oldPasswordError = this.context.t('passwordNotLongEnough');
    }
    this.setState({ oldPassword, oldPasswordError });
  }

  handlePasswordChange(password) {
    const { confirmPassword } = this.state;
    let confirmPasswordError = null;
    let passwordError = null;

    if (password && password.length < 8) {
      passwordError = this.context.t('passwordNotLongEnough');
    }

    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordError = this.context.t('passwordsDontMatch');
    }

    this.setState({ password, passwordError, confirmPasswordError });
  }

  handleConfirmPasswordChange(confirmPassword) {
    const { password } = this.state;
    let confirmPasswordError = null;

    if (password !== confirmPassword) {
      confirmPasswordError = this.context.t('passwordsDontMatch');
    }

    this.setState({ confirmPassword, confirmPasswordError });
  }

  async onClick() {
    const { password, oldPassword } = this.state;
    // call background change password
    console.log({
      password,
      oldPassword,
    });
    const bg = await getBackgroundInstanceAsync();
    if (await bg.changePassword(oldPassword, password)) {
      utilsToast.toast.success(this.context.t('changePasswordSuccess'));
      this.props.history.replace(DEFAULT_ROUTE);
    }
  }

  hasError() {
    const { passwordError, confirmPasswordError, oldPasswordError } =
      this.state;
    return passwordError || confirmPasswordError || oldPasswordError;
  }

  render() {
    const {
      oldPassword,
      password,
      confirmPassword,
      oldPasswordError,
      passwordError,
      confirmPasswordError,
    } = this.state;
    const { t } = this.context;
    const { isLoading } = this.props;
    const disabled =
      !oldPassword ||
      !password ||
      !confirmPassword ||
      isLoading ||
      this.hasError();

    return (
      <div className="first-view-main-wrapper">
        <div className="first-view-main">
          <div className="import-account">
            <a
              className="import-account__back-button"
              onClick={(e) => {
                e.preventDefault();
                this.props.history.goBack();
              }}
            >
              <span>&lt; </span>
              <span>{t('back')}</span>
            </a>
            <TextField
              id="old-password"
              label={t('oldPassword')}
              type="password"
              className="first-time-flow__input"
              value={this.state.oldPassword}
              onChange={(event) =>
                this.handleOldPasswordChange(event.target.value)
              }
              error={oldPasswordError}
              autoComplete="off"
              margin="normal"
              largeLabel
            />

            <TextField
              id="password"
              label={t('newPassword')}
              type="password"
              className="first-time-flow__input"
              value={this.state.password}
              onChange={(event) =>
                this.handlePasswordChange(event.target.value)
              }
              error={passwordError}
              autoComplete="off"
              margin="normal"
              largeLabel
            />
            <TextField
              id="confirm-password"
              label={t('confirmPassword')}
              type="password"
              className="first-time-flow__input"
              value={this.state.confirmPassword}
              onChange={(event) =>
                this.handleConfirmPasswordChange(event.target.value)
              }
              error={confirmPasswordError}
              autoComplete="off"
              margin="normal"
              largeLabel
            />
            <Button
              type="first-time"
              className="first-time-flow__button"
              onClick={() => !disabled && this.onClick()}
              disabled={disabled}
            >
              {this.context.t('changePasswordConfirm')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ appState: { isLoading } }) => ({ isLoading }),
  (dispatch) => ({
    leaveImportSeedScreenState: () => {
      dispatch(unMarkPasswordForgotten());
    },
    createNewVaultAndRestore: (pw, seed) =>
      dispatch(createNewVaultAndRestore(pw, seed)),
  }),
)(ChangePasswordPage);
