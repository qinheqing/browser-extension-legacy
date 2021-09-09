import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../ui/app/store/actions';
import utilsWalletRemove from '../utils/utilsWalletRemove';

function WalletRemoveAutomation({ isWalletRemoved }) {
  useEffect(() => {
    (async () => {
      if (
        isWalletRemoved &&
        isWalletRemoved === 'OneKey Wallet Removed Manually'
      ) {
        await utilsWalletRemove.removeWallet();
      }
    })();
  }, [isWalletRemoved]);
  return <div />;
}

const mapStateToProps = (state) => {
  const {
    metamask: { isWalletRemoved },
  } = state;

  return {
    isWalletRemoved,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WalletRemoveAutomation);
