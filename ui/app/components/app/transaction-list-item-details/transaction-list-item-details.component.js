import React, { PureComponent, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import copyToClipboard from 'copy-to-clipboard';
import { getBlockExplorerUrlForTx } from '../../../helpers/utils/transactions.util';
import SenderToRecipient from '../../ui/sender-to-recipient';
import { FLAT_VARIANT } from '../../ui/sender-to-recipient/sender-to-recipient.constants';
import TransactionActivityLog from '../transaction-activity-log';
import TransactionBreakdown from '../transaction-breakdown';
import { shortenAddress } from '../../../helpers/utils/util';
import Button from '../../ui/button';
import Tooltip from '../../ui/tooltip';
import Copy from '../../ui/icon/copy-icon.component';
import Popover from '../../ui/popover';
import { useI18nContext } from '../../../hooks/useI18nContext';

export const Address = ({ value }) => {
  const t = useI18nContext();
  const [addressCopied, setAddressCopied] = useState(false);
  const onClick = useCallback(() => {
    setAddressCopied(true);
    copyToClipboard(value);
    setTimeout(() => setAddressCopied(false), 1000);
  }, [value]);
  const title = addressCopied ? t('copiedExclamation') : t('copyToClipboard');
  return (
    <div className="transaction-list-item-details__address">
      <div>{shortenAddress(value)}</div>
      <Tooltip
        position="left"
        title={title}
        onHidden={() => setAddressCopied(false)}
      >
        <div
          className="transaction-list-item-details__address-icon"
          onClick={onClick}
        >
          <Copy size={10} color="#00b812" />
        </div>
      </Tooltip>
    </div>
  );
};

export default class TransactionListItemDetails extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static defaultProps = {
    recipientEns: null,
  };

  static propTypes = {
    onCancel: PropTypes.func,
    onRetry: PropTypes.func,
    showCancel: PropTypes.bool,
    showSpeedUp: PropTypes.bool,
    showRetry: PropTypes.bool,
    isEarliestNonce: PropTypes.bool,
    cancelDisabled: PropTypes.bool,
    primaryCurrency: PropTypes.string,
    transactionGroup: PropTypes.object,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    recipientEns: PropTypes.string,
    chainId: PropTypes.string,
    recipientAddress: PropTypes.string,
    rpcPrefs: PropTypes.object,
    senderAddress: PropTypes.string.isRequired,
    tryReverseResolveAddress: PropTypes.func.isRequired,
    senderNickname: PropTypes.string.isRequired,
    recipientNickname: PropTypes.string,
  };

  state = {
    justCopied: false,
  };

  handleEtherscanClick = () => {
    const {
      transactionGroup: { primaryTransaction },
      rpcPrefs,
    } = this.props;
    const { hash, metamaskNetworkId } = primaryTransaction;

    this.context.trackEvent({
      eventOpts: {
        category: 'Navigation',
        action: 'Activity Log',
        name: 'Clicked "View on Etherscan"',
      },
    });

    global.platform.openTab({
      url: getBlockExplorerUrlForTx(primaryTransaction, rpcPrefs),
    });
  };

  handleCancel = (event) => {
    const { onCancel, onClose } = this.props;
    onCancel(event);
    onClose();
  };

  handleRetry = (event) => {
    const { onClose, onRetry } = this.props;
    onRetry(event);
    onClose();
  };

  handleCopyTxId = () => {
    const { transactionGroup } = this.props;
    const { primaryTransaction: transaction } = transactionGroup;
    const { hash } = transaction;

    this.context.trackEvent({
      eventOpts: {
        category: 'Navigation',
        action: 'Activity Log',
        name: 'Copied Transaction ID',
      },
    });

    this.setState({ justCopied: true }, () => {
      copyToClipboard(hash);
      setTimeout(() => this.setState({ justCopied: false }), 1000);
    });
  };

  componentDidMount() {
    const { recipientAddress, tryReverseResolveAddress } = this.props;

    if (recipientAddress) {
      tryReverseResolveAddress(recipientAddress);
    }
  }

  renderCancel() {
    const { t } = this.context;
    const { showCancel, cancelDisabled } = this.props;

    if (!showCancel) {
      return null;
    }

    return cancelDisabled ? (
      <Tooltip title={t('notEnoughGas')} position="bottom">
        <div>
          <Button
            type="raised"
            onClick={this.handleCancel}
            className="transaction-list-item-details__header-button"
            disabled
          >
            {t('cancel')}
          </Button>
        </div>
      </Tooltip>
    ) : (
      <Button
        type="raised"
        onClick={this.handleCancel}
        className="transaction-list-item-details__header-button"
      >
        {t('cancel')}
      </Button>
    );
  }

  render() {
    const { t } = this.context;
    const { chainId } = this.props;
    const { justCopied } = this.state;
    const isOfficeChain = [1, 3, 4, 5, 42].includes(Number(chainId));
    const {
      transactionGroup,
      primaryCurrency,
      showSpeedUp,
      showRetry,
      recipientEns,
      recipientAddress,
      rpcPrefs: { blockExplorerUrl } = {},
      senderAddress,
      isEarliestNonce,
      senderNickname,
      title,
      onClose,
      recipientNickname,
    } = this.props;
    const {
      primaryTransaction: transaction,
      initialTransaction: { transactionCategory },
    } = transactionGroup;
    const { hash } = transaction;

    return (
      <Popover title={title} onClose={onClose}>
        <div className="transaction-list-item-details">
          <div className="transaction-list-item-details__header">
            <div>{t('details')}</div>
            <div className="transaction-list-item-details__header-buttons">
              {showSpeedUp && (
                <Button
                  type="raised"
                  onClick={this.handleRetry}
                  className="transaction-list-item-details__header-button"
                >
                  {t('speedUp')}
                </Button>
              )}
              {this.renderCancel()}
              <Tooltip
                wrapperClassName="transaction-list-item-details__header-button"
                containerClassName="transaction-list-item-details__header-button-tooltip-container"
                title={
                  justCopied ? t('copiedTransactionId') : t('copyTransactionId')
                }
              >
                <Button
                  type="raised"
                  onClick={this.handleCopyTxId}
                  disabled={!hash}
                >
                  <Copy size={10} color="#00b812" />
                </Button>
              </Tooltip>
              <Tooltip
                wrapperClassName="transaction-list-item-details__header-button"
                containerClassName="transaction-list-item-details__header-button-tooltip-container"
                title={
                  isOfficeChain ? t('viewOnEtherscan') : t('viewinExplorer')
                }
              >
                <Button
                  type="raised"
                  onClick={this.handleEtherscanClick}
                  disabled={!hash}
                >
                  <img src="/images/arrow-popout.svg" alt="" />
                </Button>
              </Tooltip>
              {showRetry && (
                <Tooltip title={t('retryTransaction')}>
                  <Button
                    type="raised"
                    onClick={this.handleRetry}
                    className="transaction-list-item-details__header-button"
                  >
                    <i className="fa fa-sync" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="transaction-list-item-details__body">
            <div className="transaction-list-item-details__sender-to-recipient-container">
              <div className="transaction-list-item-details__row">
                <div className="transaction-list-item-details__row-label">
                  From
                </div>
                <div className="transaction-list-item-details__row-content">
                  <Address value={senderAddress} />
                </div>
              </div>
              <div className="transaction-list-item-details__row">
                <div className="transaction-list-item-details__row-label">
                  To
                </div>
                <div className="transaction-list-item-details__row-content">
                  <Address value={recipientAddress} />
                </div>
              </div>
              {/* <SenderToRecipient
                warnUserOnAccountMismatch={false}
                variant={FLAT_VARIANT}
                addressOnly
                recipientEns={recipientEns}
                recipientAddress={recipientAddress}
                recipientNickname={recipientNickname}
                senderName={senderNickname}
                senderAddress={senderAddress}
                onRecipientClick={() => {
                  this.context.trackEvent({
                    eventOpts: {
                      category: 'Navigation',
                      action: 'Activity Log',
                      name: 'Copied "To" Address',
                    },
                  });
                }}
                onSenderClick={() => {
                  this.context.trackEvent({
                    eventOpts: {
                      category: 'Navigation',
                      action: 'Activity Log',
                      name: 'Copied "From" Address',
                    },
                  });
                }}
              /> */}
            </div>
            <div className="transaction-list-item-details__cards-container">
              <TransactionBreakdown
                nonce={transactionGroup.initialTransaction.txParams.nonce}
                transactionCategory={transactionCategory}
                transaction={transaction}
                primaryCurrency={primaryCurrency}
                className="transaction-list-item-details__transaction-breakdown"
              />
              <TransactionActivityLog
                transactionGroup={transactionGroup}
                className="transaction-list-item-details__transaction-activity-log"
                onCancel={this.handleCancel}
                onRetry={this.handleRetry}
                isEarliestNonce={isEarliestNonce}
              />
            </div>
          </div>
        </div>
      </Popover>
    );
  }
}
