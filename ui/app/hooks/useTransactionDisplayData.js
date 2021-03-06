import { useSelector } from 'react-redux';
import { getKnownMethodData } from '../selectors/selectors';
import {
  getStatusKey,
  getTransactionCategoryTitle,
} from '../helpers/utils/transactions.util';
import { camelCaseToCapitalize } from '../helpers/utils/common.util';
import { PRIMARY, SECONDARY } from '../helpers/constants/common';
import { getTokenAddressParam } from '../helpers/utils/token-util';
import {
  formatDateWithYearContext,
  shortenAddress,
  stripHttpSchemes,
} from '../helpers/utils/util';
import {
  PENDING_STATUS_HASH,
  TOKEN_CATEGORY_HASH,
} from '../helpers/constants/transactions';
import { getTokens } from '../ducks/metamask/metamask';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_GROUP_CATEGORIES,
  TRANSACTION_STATUSES,
} from '../../../shared/constants/transaction';
import { useI18nContext } from './useI18nContext';
import { useTokenFiatAmount } from './useTokenFiatAmount';
import { useUserPreferencedCurrency } from './useUserPreferencedCurrency';
import { useCurrencyDisplay } from './useCurrencyDisplay';
import { useTokenDisplayValue } from './useTokenDisplayValue';
import { useTokenData } from './useTokenData';
import { useSwappedTokenValue } from './useSwappedTokenValue';
import { useCurrentAsset } from './useCurrentAsset';

/**
 * @typedef {Object} TransactionDisplayData
 * @property {string} title                  - primary description of the transaction
 * @property {string} subtitle               - supporting text describing the transaction
 * @property {bool}   subtitleContainsOrigin - true if the subtitle includes the origin of the tx
 * @property {string} category               - the transaction category
 * @property {string} primaryCurrency        - the currency string to display in the primary position
 * @property {string} [secondaryCurrency]    - the currency string to display in the secondary position
 * @property {string} status                 - the status of the transaction
 * @property {string} senderAddress          - the Ethereum address of the sender
 * @property {string} recipientAddress       - the Ethereum address of the recipient
 */

/**
 * Get computed values used for displaying transaction data to a user
 *
 * The goal of this method is to perform all of the necessary computation and
 * state access required to take a transactionGroup and derive from it a shape
 * of data that can power all views related to a transaction. Presently the main
 * case is for shared logic between transaction-list-item and transaction-detail-view
 * @param {Object} transactionGroup - group of transactions
 * @return {TransactionDisplayData}
 */
export function useTransactionDisplayData(transactionGroup) {
  // To determine which primary currency to display for swaps transactions we need to be aware
  // of which asset, if any, we are viewing at present
  const currentAsset = useCurrentAsset();
  const knownTokens = useSelector(getTokens);
  const t = useI18nContext();
  const { primaryTransaction } = transactionGroup;
  let { initialTransaction } = transactionGroup;

  // if primaryTransaction is confirmed, then apply the primaryTransaction as the displayed title
  //     otherwise initialTransaction (first transaction in transactionGroup) will be applied
  if (primaryTransaction.status === TRANSACTION_STATUSES.CONFIRMED) {
    initialTransaction = primaryTransaction;
  }

  // initialTransaction contains the data we need to derive the primary purpose of this transaction group
  const { transactionCategory } = initialTransaction;

  const { from: senderAddress, to } = initialTransaction.txParams || {};

  // for smart contract interactions, methodData can be used to derive the name of the action being taken
  const methodData =
    useSelector((state) =>
      getKnownMethodData(state, initialTransaction?.txParams?.data),
    ) || {};

  const displayedStatusKey = getStatusKey(primaryTransaction);
  const isPending = displayedStatusKey in PENDING_STATUS_HASH;
  const isSubmitted = displayedStatusKey === TRANSACTION_STATUSES.SUBMITTED;

  const primaryValue = primaryTransaction.txParams?.value;
  let prefix = '-';
  const date = formatDateWithYearContext(initialTransaction.time || 0);
  let subtitle;
  let subtitleContainsOrigin = false;
  let recipientAddress = to;

  // This value is used to determine whether we should look inside txParams.data
  // to pull out and render token related information
  const isTokenCategory = TOKEN_CATEGORY_HASH[transactionCategory];

  // these values are always instantiated because they are either
  // used by or returned from hooks. Hooks must be called at the top level,
  // so as an additional safeguard against inappropriately associating token
  // transfers, we pass an additional argument to these hooks that will be
  // false for non-token transactions. This additional argument forces the
  // hook to return null
  const token =
    isTokenCategory &&
    knownTokens.find(({ address }) => address === recipientAddress);
  const tokenData = useTokenData(
    initialTransaction?.txParams?.data,
    isTokenCategory,
  );
  const tokenDisplayValue = useTokenDisplayValue(
    initialTransaction?.txParams?.data,
    token,
    isTokenCategory,
  );
  const tokenFiatAmount = useTokenFiatAmount(
    token?.address,
    tokenDisplayValue,
    token?.symbol,
  );

  const origin = stripHttpSchemes(
    initialTransaction.origin || initialTransaction.msgParams?.origin || '',
  );

  // used to append to the primary display value. initialized to either token.symbol or undefined
  // but can later be modified if dealing with a swap
  let primarySuffix = isTokenCategory ? token?.symbol : undefined;
  // used to display the primary value of tx. initialized to either tokenDisplayValue or undefined
  // but can later be modified if dealing with a swap
  let primaryDisplayValue = isTokenCategory ? tokenDisplayValue : undefined;
  // used to display fiat amount of tx. initialized to either tokenFiatAmount or undefined
  // but can later be modified if dealing with a swap
  let secondaryDisplayValue = isTokenCategory ? tokenFiatAmount : undefined;
  // The transaction group category that will be used for rendering the icon in the activity list
  let category;
  // The primary title of the Tx that will be displayed in the activity list
  let title;

  const {
    swapTokenValue,
    isNegative,
    swapTokenFiatAmount,
    isViewingReceivedTokenFromSwap,
  } = useSwappedTokenValue(transactionGroup, currentAsset);

  // There are seven types of transaction entries that are currently differentiated in the design
  // 1. Signature request
  // 2. Send (sendEth sendTokens)
  // 3. Deposit
  // 4. Site interaction
  // 5. Approval
  // 6. Swap
  // 7. Swap Approval

  if (transactionCategory === null || transactionCategory === undefined) {
    category = TRANSACTION_GROUP_CATEGORIES.SIGNATURE_REQUEST;
    title = t('signatureRequest');
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (transactionCategory === TRANSACTION_CATEGORIES.SWAP) {
    category = TRANSACTION_GROUP_CATEGORIES.SWAP;
    title = t('swapTokenToToken', [
      initialTransaction.sourceTokenSymbol,
      initialTransaction.destinationTokenSymbol,
    ]);
    subtitle = origin;
    subtitleContainsOrigin = true;
    primarySuffix = isViewingReceivedTokenFromSwap
      ? currentAsset.symbol
      : initialTransaction.sourceTokenSymbol;
    primaryDisplayValue = swapTokenValue;
    secondaryDisplayValue = swapTokenFiatAmount;
    if (isNegative) {
      prefix = '';
    } else if (isViewingReceivedTokenFromSwap) {
      prefix = '+';
    } else {
      prefix = '-';
    }
  } else if (transactionCategory === TRANSACTION_CATEGORIES.SWAP_APPROVAL) {
    category = TRANSACTION_GROUP_CATEGORIES.APPROVAL;
    title = t('swapApproval', [primaryTransaction.sourceTokenSymbol]);
    subtitle = origin;
    subtitleContainsOrigin = true;
    primarySuffix = primaryTransaction.sourceTokenSymbol;
  } else if (
    transactionCategory === TRANSACTION_CATEGORIES.TOKEN_METHOD_APPROVE
  ) {
    category = TRANSACTION_GROUP_CATEGORIES.APPROVAL;
    prefix = '';
    title = t('approveSpendLimit', [token?.symbol || t('token')]);
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (
    transactionCategory === TRANSACTION_CATEGORIES.DEPLOY_CONTRACT ||
    transactionCategory === TRANSACTION_CATEGORIES.CONTRACT_INTERACTION
  ) {
    category = TRANSACTION_GROUP_CATEGORIES.INTERACTION;
    const transactionCategoryTitle = getTransactionCategoryTitle(
      t,
      transactionCategory,
    );
    title =
      (methodData?.name && camelCaseToCapitalize(methodData.name)) ||
      transactionCategoryTitle;
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (transactionCategory === TRANSACTION_CATEGORIES.INCOMING) {
    category = TRANSACTION_GROUP_CATEGORIES.RECEIVE;
    title = t('receive');
    prefix = '';
    subtitle = t('fromAddress', [shortenAddress(senderAddress)]);
  } else if (
    transactionCategory === TRANSACTION_CATEGORIES.TOKEN_METHOD_TRANSFER_FROM ||
    transactionCategory === TRANSACTION_CATEGORIES.TOKEN_METHOD_TRANSFER
  ) {
    category = TRANSACTION_GROUP_CATEGORIES.SEND;
    title = t('sendSpecifiedTokens', [token?.symbol || t('token')]);
    recipientAddress = getTokenAddressParam(tokenData);
    subtitle = t('toAddress', [shortenAddress(recipientAddress)]);
  } else if (transactionCategory === TRANSACTION_CATEGORIES.SENT_ETHER) {
    category = TRANSACTION_GROUP_CATEGORIES.SEND;
    title = t('sendETH');
    subtitle = t('toAddress', [shortenAddress(recipientAddress)]);
  }

  const primaryCurrencyPreferences = useUserPreferencedCurrency(PRIMARY);
  const secondaryCurrencyPreferences = useUserPreferencedCurrency(SECONDARY);

  const [primaryCurrency] = useCurrencyDisplay(primaryValue, {
    prefix,
    displayValue: primaryDisplayValue,
    suffix: primarySuffix,
    ...primaryCurrencyPreferences,
  });

  const [secondaryCurrency] = useCurrencyDisplay(primaryValue, {
    prefix,
    displayValue: secondaryDisplayValue,
    hideLabel: isTokenCategory || Boolean(swapTokenValue),
    ...secondaryCurrencyPreferences,
  });

  return {
    title,
    category,
    date,
    subtitle,
    subtitleContainsOrigin,
    primaryCurrency:
      transactionCategory === TRANSACTION_CATEGORIES.SWAP && isPending
        ? ''
        : primaryCurrency,
    senderAddress,
    recipientAddress,
    secondaryCurrency:
      (isTokenCategory && !tokenFiatAmount) ||
      (transactionCategory === TRANSACTION_CATEGORIES.SWAP &&
        !swapTokenFiatAmount)
        ? undefined
        : secondaryCurrency,
    displayedStatusKey,
    isPending,
    isSubmitted,
  };
}
