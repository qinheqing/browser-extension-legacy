import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ToggleButton from '../../../components/ui/toggle-button';
import {
  CHANGE_PASSWORD_ROUTE,
  RESTORE_VAULT_ROUTE,
  REVEAL_SEED_ROUTE,
} from '../../../helpers/constants/routes';
import Button from '../../../components/ui/button';

export default class SecurityTab extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    warning: PropTypes.string,
    history: PropTypes.object,
    hwOnlyMode: PropTypes.bool,
    showIncomingTransactions: PropTypes.bool.isRequired,
    setShowIncomingTransactionsFeatureFlag: PropTypes.func.isRequired,
    setUsePhishDetect: PropTypes.func.isRequired,
    usePhishDetect: PropTypes.bool.isRequired,
  };

  renderSeedWords() {
    const { t } = this.context;
    const { history, hwOnlyMode } = this.props;
    if (hwOnlyMode) {
      return null;
    }

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{t('revealSeedWords')}</span>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <Button
              type="danger"
              large
              onClick={(event) => {
                event.preventDefault();
                this.context.trackEvent({
                  eventOpts: {
                    category: 'Settings',
                    action: 'Reveal Seed Phrase',
                    name: 'Reveal Seed Phrase',
                  },
                });
                history.push(REVEAL_SEED_ROUTE);
              }}
            >
              {t('revealSeedWords')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderChangePassword() {
    const { t } = this.context;
    const { history, hwOnlyMode } = this.props;
    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{t('changePassword')}</span>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <Button
              type="secondary"
              large
              onClick={(event) => {
                event.preventDefault();
                history.push(CHANGE_PASSWORD_ROUTE);
              }}
            >
              {t('changePassword')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderIncomingTransactionsOptIn() {
    const { t } = this.context;
    const { showIncomingTransactions, setShowIncomingTransactionsFeatureFlag } =
      this.props;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{t('showIncomingTransactions')}</span>
          <div className="settings-page__content-description">
            {t('showIncomingTransactionsDescription')}
          </div>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <ToggleButton
              value={showIncomingTransactions}
              onToggle={(value) =>
                setShowIncomingTransactionsFeatureFlag(!value)
              }
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </div>
      </div>
    );
  }

  renderPhishingDetectionToggle() {
    const { t } = this.context;
    const { usePhishDetect, setUsePhishDetect } = this.props;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{t('usePhishingDetection')}</span>
          <div className="settings-page__content-description">
            {t('usePhishingDetectionDescription')}
          </div>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <ToggleButton
              value={usePhishDetect}
              onToggle={(value) => setUsePhishDetect(!value)}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { warning } = this.props;

    return (
      <div className="settings-page__body">
        {warning && <div className="settings-tab__error">{warning}</div>}
        {this.renderSeedWords()}
        {this.renderChangePassword()}
        {this.renderIncomingTransactionsOptIn()}
        {/* {this.renderPhishingDetectionToggle()} */}
        <Button
          type="danger-primary"
          className="settings-page__remove-wallet-button"
          onClick={() => {
            this.props.history.push(RESTORE_VAULT_ROUTE);
          }}
        >
          {this.context.t('resetWalletButton')}
        </Button>
      </div>
    );
  }
}
