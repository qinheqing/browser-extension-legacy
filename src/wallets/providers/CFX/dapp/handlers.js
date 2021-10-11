// on accountsChanged: notifyAccountsChanged

import utilsApp from '../../../../utils/utilsApp';
import {
  BACKGROUND_PROXY_MODULE_NAMES,
  CONST_CHAIN_KEYS,
} from '../../../../consts/consts';
import backgroundProxy from '../../../bg/backgroundProxy';
import bgGetRootController from '../../../bg/bgGetRootController';
import storeDappApproval from '../../../dapp/storeDappApproval';

const mockAddress = 'cfxtest:aakwe36c88x8y84h53fkfk8br52m67mpkp63et1ztm';

async function handleDappMethods({ req, res, next, services }) {
  const {
    addDomainMetadata,
    isUnlocked: isUnlockedCheck,
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
  const baseChain = req?.baseChain || '';
  const chainKey = req?.chainKey || '';
  const isUnlocked = isUnlockedCheck();

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
  // - wallet_addEthereumChain // add custom chain by dapp
  // - wallet_switchEthereumChain ( ETH not implements )
  //    - metamask_switchEthereumChain
  // - wallet_watchAsset // add custom token by dapp
  //    - metamask_watchAsset
  // - eth_requestAccounts
  // - eth_accounts
  // - eth_chainId
  // -

  if (method === 'metamask_getProviderState') {
    // won't execute here, please check get-provider-state.js
    const accounts = await storeDappApproval.getAccounts({
      isUnlocked,
      baseChain,
      chainKey,
      origin,
    });
    const chainMeta = await storeDappApproval.getChainMeta();
    res.result = {
      isUnlocked,
      ...chainMeta,
      accounts, // return [] if locked
    };
    return;
  }

  if (method === 'metamask_sendDomainMetadata') {
    if (typeof req.params?.name === 'string') {
      /*
      {
        icon: "https://335wo.csb.app/favicon.ico"
        name: "React App"
      }
       */
      const domainMeta = req.params;
      // "https://335wo.csb.app"
      const reqOrigin = req.origin;
      addDomainMetadata(reqOrigin, domainMeta);
    }
    res.result = true;
    return;
  }

  // conflux.request({method:'cfx_requestAccounts'}).then(console.log)
  if (method === 'cfx_requestAccounts') {
    // return [] if locked
    // emit accountsChanged event
    // await requestAccountsPermission(); // -> wallet_requestPermissions
    const accounts = await storeDappApproval.requestAccounts({
      isUnlocked,
      request: req,
      baseChain,
      chainKey,
      origin,
    });
    res.result = accounts;
    return;
  }

  // conflux.request({method:'cfx_accounts'}).then(console.log)
  if (method === 'cfx_accounts') {
    // return [] if locked
    // emit accountsChanged event
    const accounts = await storeDappApproval.getAccounts({
      isUnlocked,
      baseChain,
      chainKey,
      origin,
    });
    res.result = accounts;
    return;
  }

  if (method === 'cfx_chainId') {
    const chainMeta = await storeDappApproval.getChainMeta();
    res.result = chainMeta.chainId;
    return;
  }

  // chain rpc method ----------------------------------------------
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
