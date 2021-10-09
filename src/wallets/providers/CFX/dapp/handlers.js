// on accountsChanged: notifyAccountsChanged

import utilsApp from '../../../../utils/utilsApp';
import {
  BACKGROUND_PROXY_MODULE_NAMES,
  CONST_CHAIN_KEYS,
} from '../../../../consts/consts';
import backgroundProxy from '../../../bg/backgroundProxy';
import bgGetRootController from '../../../bg/bgGetRootController';
import bgDappApproval from '../../../dapp/bgDappApproval';

const mockAddress = 'cfxtest:aakwe36c88x8y84h53fkfk8br52m67mpkp63et1ztm';

async function handleDappMethods({ req, res, next, services }) {
  const {
    addDomainMetadata,
    isUnlocked,
    getAccounts,
    getUnlockPromise,
    hasPermission,
    notifyAccountsChanged,
    requestAccountsPermission,
  } = services;
  if (req) {
    req.baseChain = req.baseChain || CONST_CHAIN_KEYS.CFX;
  }
  let method = req?.method || '';
  const origin = req?.origin || '';

  if (typeof method === 'string' && method.startsWith('eth_')) {
    method = method.replace(/^eth_/giu, 'cfx_');
  }

  /* TODO network changed events change these fields will cause dapp error, provider init set value error
    conflux.chainId='0x2a'
    conflux.networkVersion='42'
    conflux.selectedAddress='cfxtest:aakwe36c88x8y84h53fkfk8br52m67mpkp63et1ztm'
  */
  res.cfx_isMocked = true; // TODO remove

  // wallet method ----------------------------------------------
  // - onekey_getProviderOverwriteEnabled
  // - onekey_setOtherProviderStatus
  // - metamask_getProviderState
  // - metamask_sendDomainMetadata
  // - wallet_addEthereumChain
  // - wallet_switchEthereumChain ( ETH not implements )
  // - wallet_watchAsset, metamask_watchAsset // add token
  // - eth_requestAccounts
  // - eth_accounts
  // - eth_chainId
  // -

  if (method === 'metamask_getProviderState') {
    // won't execute here, please check get-provider-state.js
    res.result = {
      isUnlocked: isUnlocked(),
      accounts: [mockAddress], // return [] if locked
      chainId: '0x1',
      networkVersion: '1',
      chainKey: 'CFX',
    };
    return;
  }

  if (method === 'metamask_sendDomainMetadata') {
    if (typeof req.params?.name === 'string') {
      addDomainMetadata(req.origin, req.params);
    }
    res.result = true;
    return;
  }

  /*
     {
       id: 1901492225
       jsonrpc: "2.0"
       method: "cfx_requestAccounts"
       origin: "https://moonswap.fi"
       tabId: 56
     }
  */
  if (method === 'cfx_requestAccounts') {
    // return [] if locked
    // emit accountsChanged event
    res.result = [];
    const accounts = await bgDappApproval.openApprovalPopup(req);
    // TODO save to storage
    // await requestAccountsPermission(); // -> wallet_requestPermissions
    res.result = accounts;
    return;
  }

  if (method === 'cfx_accounts') {
    // return [] if locked
    // emit accountsChanged event
    res.result = [mockAddress];
    return;
  }

  // chain method ----------------------------------------------
  // - eth_blockNumber
  // - eth_epochNumber
  // - eth_call
  // - net_version

  console.log('RPC handleDappMethods', req);

  // blacklist methods reject ----------------------------------------------
}

export default {
  handleDappMethods,
};
