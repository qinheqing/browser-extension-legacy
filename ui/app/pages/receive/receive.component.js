import React, { useCallback } from 'react';
import PageLayout from '../../components/ui/page-layout';
import QrView from '../../components/ui/qr-code';
import EditableLabel from '../../components/ui/editable-label';
import getAccountLink from '../../../lib/account-link';
import Button from '../../components/ui/button';
import { useI18nContext } from '../../hooks/useI18nContext';
import { shortenAddress } from '../../helpers/utils/util';

const Receive = (props) => {
  const {
    selectedIdentity,
    network,
    chainId,
    showExportPrivateKeyModal,
    setAccountLabel,
    keyrings,
    rpcPrefs,
    history,
  } = props;
  const { name, address } = selectedIdentity;
  const t = useI18nContext();
  const onClick = useCallback(() => {
    history.goBack();
  }, []);

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
    <PageLayout
      className="receive"
      // title="Receive"
      title={t('receive')}
      onBack={onClick}
      subtitle={shortenAddress(address)}
    >
      <div>
        <div className="receive__header">
          <EditableLabel
            className="receive__address-name"
            defaultValue={name}
            onSubmit={(label) => setAccountLabel(address, label)}
          />
        </div>
        <QrView
          Qr={{
            data: address,
          }}
        />
        <div className="receive__button-group">
          <Button
            type="secondary"
            className="receive__button"
            onClick={() => {
              global.platform.openTab({
                url: getAccountLink(address, chainId, rpcPrefs, network),
              });
            }}
          >
            {rpcPrefs.blockExplorerUrl
              ? t('blockExplorerView', [
                  rpcPrefs.blockExplorerUrl.match(/^https?:\/\/(.+)/u)[1],
                ])
              : t('viewOnEtherscan')}
          </Button>

          {exportPrivateKeyFeatureEnabled ? (
            <Button
              type="secondary"
              className="receive__button"
              onClick={() => showExportPrivateKeyModal()}
            >
              {t('exportPrivateKey')}
            </Button>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};

export default Receive;
