// on accountsChanged: notifyAccountsChanged

import { ethErrors } from 'eth-rpc-errors';
import { Conflux, Contract, format } from 'js-conflux-sdk';
import * as jsConfluxSdk from 'js-conflux-sdk';
import { isPlainObject, isString, isArray } from 'lodash';
import utilsApp from '../../../../utils/utilsApp';
import {
  BACKGROUND_PROXY_MODULE_NAMES,
  CONST_CHAIN_KEYS,
} from '../../../../consts/consts';
import backgroundProxy from '../../../bg/backgroundProxy';
import bgGetRootController from '../../../bg/bgGetRootController';
import storeDappApproval from '../../../dapp/storeDappApproval';
import utils from '../utils/utils';

const mockAddress = 'cfxtest:aakwe36c88x8y84h53fkfk8br52m67mpkp63et1ztm';
global.$ok_jsConfluxSdk = jsConfluxSdk;
global.$ok_confluxUtils = utils;

// RPC server error:
//  "invalid argument 0: failed to create address from base32 string 0x8a5c9db7f480083373274e3d2bf41ff628a9f1e0: base32 string 0x8a5c9db7f480083373274e3d2bf41ff628a9f1e0 is invalid format"
function convertAddress(p, chainId) {
  // 0x8a5c9db7f480083373274e3d2bf41ff628a9f1e0
  //  ->
  // cfx:aamr93vsstxs457rnhxe99wbxwy1n2bpuefunhrvh2
  try {
    const f = format;
    const networkIdInt = parseInt(chainId, 16);
    if (utils.isHexAddressLike(p.from)) {
      p.from = f.address(p.from, networkIdInt);
    }

    if (utils.isHexAddressLike(p.to)) {
      p.to = f.address(p.to, networkIdInt);
    }
    return p;
  } catch (error) {
    return p;
  }
}

// https://github.com/Conflux-Chain/conflux-portal/blob/develop/app/scripts/controllers/network/createBase32AddressMiddleware.js
// https://github.com/Conflux-Chain/conflux-portal/blob/develop/app/scripts/controllers/network/createCfxMiddleware.js
// createBlockRefRewriteMiddleware:   add block number to last params
function convertParamsAddress(params, chainId) {
  if (isPlainObject(params)) {
    return convertAddress(params, chainId);
  }

  if (isArray(params)) {
    let paramsArr = params;
    paramsArr = params.map((p) => convertAddress(p, chainId));
    // rename last parameter = "latest" | "latest_mined"
    const lastParam = paramsArr[paramsArr.length - 1];
    if (
      // RPC ERROR:
      //    invalid argument 1: hex string without 0x prefix
      lastParam === 'latest' ||
      // RPC ERROR:
      //    Error processing request: Latest mined epoch is not executed
      lastParam === 'latest_mined'
    ) {
      // OK: latest_state
      paramsArr[paramsArr.length - 1] = 'latest_state';
      // paramsArr = paramsArr.slice(0, paramsArr.length - 1); // remove last param
    }
    return paramsArr;
  }
  return params;
}

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
    const txid = await storeDappApproval.openApprovalPopup(req);
    res.result = txid;
    return;
  }

  // chain rpc method ----------------------------------------------
  // TODO unlock check
  // - eth_blockNumber
  // - eth_epochNumber
  // - eth_call
  // - net_version

  console.log('RPC handleDappMethods', req);
  req.params = convertParamsAddress(req.params, req.chainId);

  const wallet = await storeDappApproval.createWallet();
  const rpc = wallet.chainManager.apiRpc.provider;
  const rpcRes = await rpc.call(req.method, ...[].concat(req.params || []));
  res.result = rpcRes;
  return;

  // blacklist methods reject ----------------------------------------------
  // eslint-disable-next-line no-unreachable
  throw ethErrors.provider.unsupportedMethod({
    data: {
      method,
    },
  });
}

export default {
  handleDappMethods,
};
