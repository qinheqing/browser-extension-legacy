import { stripHexPrefix } from 'ethereumjs-util';
import { createSelector } from 'reselect';
import { addHexPrefix } from '../../../app/scripts/lib/util';
import {
  MAINNET,
  TEST_CHAINS,
  NETWORK_TYPE_RPC,
  NETWORK_TYPE_TO_ID_MAP,
  BUILDINT_PROVIDER_TYPES,
  MAINNET_CHAIN_ID,
} from '../../../shared/constants/network';
import {
  shortenAddress,
  checksumAddress,
  getAccountByAddress,
  keyringTypeToAccountType,
  getAccountMetaInfo,
  getAccountKeyring,
} from '../helpers/utils/util';
import { contractMap } from '../../../shared/tokens';
import { WALLET_ACCOUNT_TYPES } from '../helpers/constants/common';
import { getPermissionsRequestCount } from './permissions';

export function isNetworkLoading(state) {
  return state.metamask.network === 'loading';
}

export function getNetworkIdentifier(state) {
  const {
    metamask: {
      provider: { type, nickname, rpcUrl },
    },
  } = state;

  return nickname || rpcUrl || type;
}

export function getProviderNetworkIdentifier(state) {
  const { provider } = state.metamask;
  return provider.type === NETWORK_TYPE_RPC ? provider.rpcUrl : provider.type;
}

export function getCurrentChainId(state) {
  const { chainId } = state.metamask.provider;
  return chainId;
}

export function getCurrentKeyring(state) {
  const identity = getSelectedIdentity(state);

  if (!identity) {
    return null;
  }

  return getAccountKeyring({
    account: identity,
    keyrings: state.metamask.keyrings,
  });
}

// current selected account type
export function getAccountType(state) {
  const currentKeyring = getCurrentKeyring(state);
  const keyringType = currentKeyring && currentKeyring.type;

  return keyringTypeToAccountType(keyringType);
}

/**
 * get the currently selected networkId which will be 'loading' when the
 * network changes. The network id should not be used in most cases,
 * instead use chainId in most situations. There are a limited number of
 * use cases to use this method still, such as when comparing transaction
 * metadata that predates the switch to using chainId.
 * @deprecated - use getCurrentChainId instead
 * @param {Object} state - redux state object
 */
export function deprecatedGetCurrentNetworkId(state) {
  return state.metamask.network;
}

export const getMetaMaskAccounts = createSelector(
  getMetaMaskAccountsRaw,
  getMetaMaskCachedBalances,
  getMetaMaskKeyrings,
  (currentAccounts, cachedBalances, keyrings) =>
    Object.entries(currentAccounts).reduce(
      (selectedAccounts, [accountID, account]) => {
        const accountMeta = getAccountMetaInfo({
          account: { address: accountID },
          keyrings,
        });
        let accountToAdd = {};
        if (account.balance === null || account.balance === undefined) {
          accountToAdd = {
            [accountID]: {
              ...accountMeta,
              ...account,
              balance: cachedBalances && cachedBalances[accountID],
            },
          };
        } else {
          accountToAdd = {
            [accountID]: {
              ...accountMeta,
              ...account,
            },
          };
        }
        return {
          ...selectedAccounts,
          ...accountToAdd,
        };
      },
      {},
    ),
);

export function getSelectedAddress(state) {
  // current selected account address
  return state.metamask.selectedAddress;
}

export function getSelectedIdentity(state) {
  const selectedAddress = getSelectedAddress(state);
  const { identities } = state.metamask;

  return identities[selectedAddress];
}

export function getNumberOfAccounts(state) {
  return Object.keys(state.metamask.accounts).length;
}

export function getNumberOfTokens(state) {
  const { tokens } = state.metamask;
  return tokens ? tokens.length : 0;
}

export function getMetaMaskKeyrings(state) {
  return state.metamask.keyrings;
}

export function getMetaMaskState(state) {
  return state.metamask;
}

export function getMetaMaskIdentities(state) {
  return state.metamask.identities;
}

export function getMetaMaskAccountsRaw(state) {
  return state.metamask.accounts;
}

export function getMetaMaskCachedBalances(state) {
  const chainId = getCurrentChainId(state);
  const network = deprecatedGetCurrentNetworkId(state);

  return (
    state.metamask.cachedBalances[chainId] ??
    state.metamask.cachedBalances[network]
  );
}

/**
 * Get ordered (by keyrings) accounts with identity and balance
 */
export const getMetaMaskAccountsOrdered = createSelector(
  getHwOnlyMode,
  getMetaMaskKeyrings,
  getMetaMaskIdentities,
  getMetaMaskAccounts,
  (hwOnlyMode, keyrings, identities, accounts) => {
    const orderedAccounts = keyrings
      .reduce((list, keyring) => list.concat(keyring.accounts), [])
      .filter((address) => {
        if (hwOnlyMode && accounts[address]?.accountType) {
          if (accounts[address].accountType !== WALLET_ACCOUNT_TYPES.HARDWARE) {
            return false;
          }
        }
        return Boolean(identities[address]);
      })
      .map((address) => {
        const account = { ...identities[address], ...accounts[address] };
        return account;
      });
    return orderedAccounts;
  },
);

export const getMetaMaskAccountsConnected = createSelector(
  getMetaMaskAccountsOrdered,
  (connectedAccounts) =>
    connectedAccounts.map(({ address }) => address.toLowerCase()),
);

export function isBalanceCached(state) {
  const selectedAccount = state.metamask.accounts[getSelectedAddress(state)];
  const selectedAccountBalance = selectedAccount && selectedAccount.balance;
  const cachedBalance = getSelectedAccountCachedBalance(state);

  return Boolean(!selectedAccountBalance && cachedBalance);
}

export function getSelectedAccountCachedBalance(state) {
  const cachedBalances = getMetaMaskCachedBalances(state);
  const selectedAddress = getSelectedAddress(state);

  return cachedBalances && cachedBalances[selectedAddress];
}

export function getSelectedAccount(state) {
  const accountsOrdered = getMetaMaskAccountsOrdered(state);
  const selectedAddress = getSelectedAddress(state);
  const accounts = accountsOrdered.reduce((res, acc) => {
    res[acc.address] = acc;
    return res;
  }, {});
  return accounts[selectedAddress];
}

export function getTargetAccount(state, targetAddress) {
  const accounts = getMetaMaskAccounts(state);
  return accounts[targetAddress];
}

export const getTokenExchangeRates = (state) =>
  state.metamask.contractExchangeRates;

export function getAssetImages(state) {
  const assetImages = state.metamask.assetImages || {};
  return assetImages;
}

export function getContractMap(state) {
  const { type } = state.metamask.provider;
  return contractMap[type] ? contractMap[type] : contractMap.eth;
}

export function getAddressBook(state) {
  const chainId = getCurrentChainId(state);
  if (!state.metamask.addressBook[chainId]) {
    return [];
  }
  return Object.values(state.metamask.addressBook[chainId]);
}

export function getAddressBookEntry(state, address) {
  const addressBook = getAddressBook(state);
  const entry = addressBook.find(
    (contact) => contact.address === checksumAddress(address),
  );
  return entry;
}

export function getAddressBookEntryName(state, address) {
  const entry =
    getAddressBookEntry(state, address) || state.metamask.identities[address];
  return entry && entry.name !== '' ? entry.name : shortenAddress(address);
}

export function accountsWithSendEtherInfoSelector(state) {
  const accounts = getMetaMaskAccounts(state);
  const identities = getMetaMaskIdentities(state);

  const accountsWithSendEtherInfo = Object.entries(identities).map(
    ([key, identity]) => {
      return { ...identity, ...accounts[key] };
    },
  );

  // DO NOT filter hwOnly here, page code will be failed if no HD account founded!
  // accountsWithSendEtherInfo = filterAccountsByHwOnly({
  //   accounts: accountsWithSendEtherInfo,
  //   hwOnlyMode,
  // });

  return accountsWithSendEtherInfo;
}

export function getAccountsWithLabels(state) {
  return getMetaMaskAccountsOrdered(state).map(
    ({ address, name, balance }) => ({
      address,
      addressLabel: `${name} (...${address.slice(address.length - 4)})`,
      label: name,
      balance,
    }),
  );
}

export function getCurrentAccountWithSendEtherInfo(state) {
  const currentAddress = getSelectedAddress(state);
  const accounts = accountsWithSendEtherInfoSelector(state);

  return getAccountByAddress(accounts, currentAddress);
}

export function getTargetAccountWithSendEtherInfo(state, targetAddress) {
  const accounts = accountsWithSendEtherInfoSelector(state);
  return getAccountByAddress(accounts, targetAddress);
}

export function getCurrentEthBalance(state) {
  return getCurrentAccountWithSendEtherInfo(state).balance;
}

export function getGasIsLoading(state) {
  return state.appState.gasIsLoading;
}

export function getCurrentCurrency(state) {
  return state.metamask.currentCurrency;
}

export function getHwOnlyMode(state) {
  return state.metamask.hwOnlyMode;
}

export function getTotalUnapprovedCount(state) {
  const {
    unapprovedMsgCount = 0,
    unapprovedPersonalMsgCount = 0,
    unapprovedDecryptMsgCount = 0,
    unapprovedEncryptionPublicKeyMsgCount = 0,
    unapprovedTypedMessagesCount = 0,
    pendingApprovalCount = 0,
  } = state.metamask;

  return (
    unapprovedMsgCount +
    unapprovedPersonalMsgCount +
    unapprovedDecryptMsgCount +
    unapprovedEncryptionPublicKeyMsgCount +
    unapprovedTypedMessagesCount +
    pendingApprovalCount +
    getUnapprovedTxCount(state) +
    getPermissionsRequestCount(state) +
    getSuggestedTokenCount(state)
  );
}

function getUnapprovedTxCount(state) {
  const { unapprovedTxs = {} } = state.metamask;
  return Object.keys(unapprovedTxs).length;
}

function getSuggestedTokenCount(state) {
  const { suggestedTokens = {} } = state.metamask;
  return Object.keys(suggestedTokens).length;
}

export function getIsMainnet(state) {
  const chainId = getCurrentChainId(state);
  return chainId === MAINNET_CHAIN_ID;
}

export function getUnapprovedConfirmations(state) {
  const { pendingApprovals } = state.metamask;
  return Object.values(pendingApprovals);
}

export function getIsBuiltnet(state) {
  const { type } = getProvider(state);
  return BUILDINT_PROVIDER_TYPES.includes(type);
}

export function getIsTestnet(state) {
  const chainId = getCurrentChainId(state);
  return TEST_CHAINS.includes(chainId);
}

export function getPreferences({ metamask }) {
  return metamask.preferences;
}

export function getShouldShowFiat(state) {
  const isMainNet = getIsMainnet(state);
  const isBuiltNet = getIsBuiltnet(state);
  const { showFiatInTestnets } = getPreferences(state);
  return Boolean(isMainNet || isBuiltNet || showFiatInTestnets);
}

export function getProvider(state) {
  return state.metamask.provider;
}

export function getEtherLogo(state) {
  const { type } = state.metamask.provider;
  return (
    (NETWORK_TYPE_TO_ID_MAP[type] && NETWORK_TYPE_TO_ID_MAP[type].image) ||
    './images/eth_logo.svg'
  );
}

export function getAdvancedInlineGasShown(state) {
  return Boolean(state.metamask.featureFlags.advancedInlineGas);
}

export function getUseNonceField(state) {
  return Boolean(state.metamask.useNonceField);
}

export function getCustomNonceValue(state) {
  return String(state.metamask.customNonceValue);
}

export function getDomainMetadata(state) {
  return state.metamask.domainMetadata;
}

export function getRpcPrefsForCurrentProvider(state) {
  const { frequentRpcListDetail, provider } = state.metamask;
  const selectRpcInfo = frequentRpcListDetail.find(
    (rpcInfo) => rpcInfo.rpcUrl === provider.rpcUrl,
  );
  const { rpcPrefs = {} } = selectRpcInfo || {};
  return rpcPrefs;
}

export function getKnownMethodData(state, data) {
  if (!data) {
    return null;
  }
  const prefixedData = addHexPrefix(data);
  const fourBytePrefix = prefixedData.slice(0, 10);
  const { knownMethodData } = state.metamask;

  return knownMethodData && knownMethodData[fourBytePrefix];
}

export function getFeatureFlags(state) {
  return state.metamask.featureFlags;
}

export function getOriginOfCurrentTab(state) {
  return state.activeTab.origin;
}

export function getIpfsGateway(state) {
  return state.metamask.ipfsGateway;
}

export function getUSDConversionRate(state) {
  return state.metamask.usdConversionRate;
}

export function getWeb3ShimUsageStateForOrigin(state, origin) {
  return state.metamask.web3ShimUsageOrigins[origin];
}
