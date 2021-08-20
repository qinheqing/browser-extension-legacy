import BigNumber from 'bignumber.js';
import { calcTokenAmount } from '../../helpers/utils/token-util';
import { toPrecisionWithoutTrailingZeros } from '../../helpers/utils/util';

import { subtractCurrencies } from '../../helpers/utils/conversion-util';
import { calcGasTotal } from '../send/send.utils';

const TOKEN_TRANSFER_LOG_TOPIC_HASH =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export function getSwapsTokensReceivedFromTxMeta(
  tokenSymbol,
  txMeta,
  tokenAddress,
  accountAddress,
  tokenDecimals,
  approvalTxMeta,
) {
  const txReceipt = txMeta?.txReceipt;
  if (tokenSymbol === 'ETH') {
    if (
      !txReceipt ||
      !txMeta ||
      !txMeta.postTxBalance ||
      !txMeta.preTxBalance
    ) {
      return null;
    }

    let approvalTxGasCost = '0x0';
    if (approvalTxMeta && approvalTxMeta.txReceipt) {
      approvalTxGasCost = calcGasTotal(
        approvalTxMeta.txReceipt.gasUsed,
        approvalTxMeta.txParams.gasPrice,
      );
    }

    const gasCost = calcGasTotal(txReceipt.gasUsed, txMeta.txParams.gasPrice);
    const totalGasCost = new BigNumber(gasCost, 16)
      .plus(approvalTxGasCost, 16)
      .toString(16);

    const preTxBalanceLessGasCost = subtractCurrencies(
      txMeta.preTxBalance,
      totalGasCost,
      {
        aBase: 16,
        bBase: 16,
        toNumericBase: 'hex',
      },
    );

    const ethReceived = subtractCurrencies(
      txMeta.postTxBalance,
      preTxBalanceLessGasCost,
      {
        aBase: 16,
        bBase: 16,
        fromDenomination: 'WEI',
        toDenomination: 'ETH',
        toNumericBase: 'dec',
        numberOfDecimals: 6,
      },
    );
    return ethReceived;
  }
  const txReceiptLogs = txReceipt?.logs;
  if (txReceiptLogs && txReceipt?.status !== '0x0') {
    const tokenTransferLog = txReceiptLogs.find((txReceiptLog) => {
      const isTokenTransfer =
        txReceiptLog.topics &&
        txReceiptLog.topics[0] === TOKEN_TRANSFER_LOG_TOPIC_HASH;
      const isTransferFromGivenToken = txReceiptLog.address === tokenAddress;
      const isTransferFromGivenAddress =
        txReceiptLog.topics &&
        txReceiptLog.topics[2] &&
        txReceiptLog.topics[2].match(accountAddress.slice(2));
      return (
        isTokenTransfer &&
        isTransferFromGivenToken &&
        isTransferFromGivenAddress
      );
    });
    return tokenTransferLog
      ? toPrecisionWithoutTrailingZeros(
          calcTokenAmount(tokenTransferLog.data, tokenDecimals).toString(10),
          6,
        )
      : '';
  }
  return null;
}
