// on accountsChanged: notifyAccountsChanged

import { ethErrors } from 'eth-rpc-errors';
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

  if (typeof method === 'string' && method.startsWith('eth_')) {
    method = method.replace(/^eth_/giu, 'cfx_');
  }

  /*
  TODO
  - can invoke locked
  - can invoke at other chain
    - same baseChain (ETH,BSC,HECO)
    - different baseChain (EVM,SOL,CFX)
  - event emit
    - chainId
    - accounts
    - mock at other chain
   */

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
      baseChain,
      chainKey,
      origin,
    });
    const chainMeta = await storeDappApproval.getChainMeta();
    res.result = {
      // always call function to get latest unlock status
      isUnlocked: global.$ok_isUnlockedCheck(),
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

  // transaction and sign ----------------------------------------------
  // TODO unlock check
  // - cfx_sendTransaction
  if (method === 'cfx_sendTransaction') {
    await storeDappApproval.openApprovalPopup(req);
    res.result = '0x8837777777';
    return;
  }

  // chain rpc method ----------------------------------------------
  // TODO unlock check
  // - eth_blockNumber
  // - eth_epochNumber
  // - eth_call
  // - net_version

  console.log('RPC handleDappMethods', req);
  const wallet = await storeDappApproval.createWallet();

  // blacklist methods reject ----------------------------------------------
  throw ethErrors.provider.unsupportedMethod({
    data: {
      method,
    },
  });
}

export default {
  handleDappMethods,
};
