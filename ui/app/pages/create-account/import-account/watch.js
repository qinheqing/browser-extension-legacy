import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isValidAddress } from "ethereumjs-util"
import * as actions from '../../../store/actions';
import { getMetaMaskAccounts } from '../../../selectors';
import Button from '../../../components/ui/button';
import { getMostRecentOverviewPage } from '../../../ducks/history/history';

class PrivateKeyImportView extends Component {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  static propTypes = {
    importWatchAccount: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    displayWarning: PropTypes.func.isRequired,
    setSelectedAddress: PropTypes.func.isRequired,
    firstAddress: PropTypes.string.isRequired,
    error: PropTypes.node,
    mostRecentOverviewPage: PropTypes.string.isRequired,
  };

  inputRef = React.createRef();

  state = { isEmpty: true };

  createNewKeychain() {
    const watchAccount = this.inputRef.current.value;
    const {
      importWatchAccount,
      history,
      displayWarning,
      mostRecentOverviewPage,
      setSelectedAddress,
      firstAddress,
    } = this.props;

    const isValid = isValidAddress(watchAccount);
    if (!isValid) {
      displayWarning("Error Invalid address format");
      return 
    }

    importWatchAccount(watchAccount)
      .then(({ selectedAddress }) => {
        if (selectedAddress) {
          history.push(mostRecentOverviewPage);
          displayWarning(null);
        } else {
          displayWarning('Error importing watch account.');
          setSelectedAddress(firstAddress);
        }
      })
      .catch((err) => err && displayWarning(err.message || err));
  }

  createKeyringOnEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.createNewKeychain();
    }
  };

  checkInputEmpty() {
    const watchAccount = this.inputRef.current.value;
    let isEmpty = true;
    if (watchAccount !== '') {
      isEmpty = false;
    }
    this.setState({ isEmpty });
  }

  render() {
    const { error, displayWarning } = this.props;

    return (
      <div className="new-account-import-form__private-key">
        <span className="new-account-create-form__instruction">
          {this.context.t('pasteWatchAccount')}
        </span>
        <div className="new-account-import-form__private-key-password-container">
          <input
            className="new-account-import-form__input-password"
            id="watch-account-key-box"
            onKeyPress={(e) => this.createKeyringOnEnter(e)}
            onChange={() => this.checkInputEmpty()}
            ref={this.inputRef}
            autoFocus
          />
        </div>
        <div className="new-account-import-form__buttons">
          <Button
            type="default"
            large
            className="new-account-create-form__button"
            onClick={() => {
              const { history, mostRecentOverviewPage } = this.props;
              displayWarning(null);
              history.push(mostRecentOverviewPage);
            }}
          >
            {this.context.t('cancel')}
          </Button>
          <Button
            type="secondary"
            large
            className="new-account-create-form__button"
            onClick={() => this.createNewKeychain()}
            disabled={this.state.isEmpty}
          >
            {this.context.t('import')}
          </Button>
        </div>
        {error ? <span className="error">{error}</span> : null}
      </div>
    );
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(PrivateKeyImportView);

function mapStateToProps(state) {
  return {
    error: state.appState.warning,
    firstAddress: Object.keys(getMetaMaskAccounts(state))[0],
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    importWatchAccount: (address) => {
      return dispatch(actions.importWatchAccount(address));
    },
    displayWarning: (message) =>
      dispatch(actions.displayWarning(message || null)),
    setSelectedAddress: (address) =>
      dispatch(actions.setSelectedAddress(address)),
  };
}
