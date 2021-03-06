import ethUtil from 'ethereumjs-util';
import contractMap from '@onekeyhq/contract-metadata';
import {
  REQUIRED_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  KNOWN_RECIPIENT_ADDRESS_ERROR,
  INVALID_RECIPIENT_ADDRESS_NOT_ETH_NETWORK_ERROR,
} from '../../send.constants';

import {
  isValidAddress,
  checkExistingAddresses,
  isDefaultMetaMaskChain,
} from '../../../../helpers/utils/util';

export function getToErrorObject(to, hasHexData = false, chainId) {
  let toError = null;
  if (!to) {
    if (!hasHexData) {
      toError = REQUIRED_ERROR;
    }
  } else if (!isValidAddress(to) && !toError) {
    toError = isDefaultMetaMaskChain(chainId)
      ? INVALID_RECIPIENT_ADDRESS_ERROR
      : INVALID_RECIPIENT_ADDRESS_NOT_ETH_NETWORK_ERROR;
  }

  return { to: toError };
}

export function getToWarningObject(to, tokens = [], sendToken = null) {
  let toWarning = null;
  if (
    sendToken &&
    (ethUtil.toChecksumAddress(to) in contractMap ||
      checkExistingAddresses(to, tokens))
  ) {
    toWarning = KNOWN_RECIPIENT_ADDRESS_ERROR;
  }
  return { to: toWarning };
}
