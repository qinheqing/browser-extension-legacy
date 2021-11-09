import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@onekeyhq/ui-components';
import { useDispatch, useSelector } from 'react-redux';
import AccountModalContainer from '../account-modal-container';
import getAccountLink from '../../../../../lib/account-link';
import QrView from '../../../ui/qr-code';
import EditableLabel from '../../../ui/editable-label';
import { getCurrentKeyring, getSelectedIdentity } from '../../../../selectors';
import utilsApp from '../../../../../../src/utils/utilsApp';
import useI18n from '../../../../../../src/hooks/useI18n';
import { showModal } from '../../../../store/actions';

function RemoveAccountButton() {
  const t = useI18n();
  const dispatch = useDispatch();
  const keyring = useSelector(getCurrentKeyring);
  const selectedIdentity = useSelector(getSelectedIdentity);
  const { address } = selectedIdentity;
  const isRemovable = utilsApp.isOldHome() && keyring.type !== 'HD Key Tree';

  if (isRemovable) {
    return (
      <>
        <div className="h-2" />
        <Button
          block
          type="destructive"
          onClick={() => {
            dispatch(
              showModal({
                name: 'CONFIRM_REMOVE_ACCOUNT',
                identity: selectedIdentity,
              }),
            );
          }}
        >
          {t('removeAccount')}
        </Button>
      </>
    );
  }
  return null;
}

export default class AccountDetailsModal extends Component {
  static propTypes = {
    selectedIdentity: PropTypes.object,
    network: PropTypes.string,
    chainId: PropTypes.string,
    showExportPrivateKeyModal: PropTypes.func,
    setAccountLabel: PropTypes.func,
    keyrings: PropTypes.array,
    rpcPrefs: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const {
      selectedIdentity,
      network,
      chainId,
      showExportPrivateKeyModal,
      setAccountLabel,
      keyrings,
      rpcPrefs,
    } = this.props;
    const { name, address } = selectedIdentity;

    const keyring = keyrings.find((kr) => {
      return kr.accounts.includes(address);
    });

    let exportPrivateKeyFeatureEnabled = true;
    // This feature is disabled for hardware wallets
    if (
      keyring?.type?.search('Hardware') !== -1 ||
      keyring?.type?.search('Watch Account') !== -1
    ) {
      exportPrivateKeyFeatureEnabled = false;
    }

    return (
      <AccountModalContainer className="account-details-modal">
        <EditableLabel
          className="account-details-modal__name"
          defaultValue={name}
          onSubmit={(label) => setAccountLabel(address, label)}
        />

        <QrView
          Qr={{
            data: address,
          }}
        />

        <div className="account-details-modal__divider" />

        <div className="px-4 pt-4 w-full">
          <Button
            block
            onClick={() => {
              global.platform.openTab({
                url: getAccountLink(address, chainId, rpcPrefs, network),
              });
            }}
          >
            {rpcPrefs.blockExplorerUrl
              ? this.context.t('blockExplorerView', [
                  rpcPrefs.blockExplorerUrl.match(/^https?:\/\/(.+)/u)[1],
                ])
              : this.context.t('viewinExplorer')}
          </Button>
          <div className="h-2" />

          {exportPrivateKeyFeatureEnabled ? (
            <>
              <Button block onClick={() => showExportPrivateKeyModal()}>
                {this.context.t('exportPrivateKey')}
              </Button>
              <div className="h-2" />
            </>
          ) : null}

          <RemoveAccountButton />
        </div>
      </AccountModalContainer>
    );
  }
}
