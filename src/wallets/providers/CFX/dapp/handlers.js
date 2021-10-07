// on accountsChanged: notifyAccountsChanged

const mockAddress = 'cfxtest:aakwe36c88x8y84h53fkfk8br52m67mpkp63et1ztm';

async function handleDappMethods({ req, res, next, services }) {
  const {
    addDomainMetadata,
    getAccounts,
    getUnlockPromise,
    hasPermission,
    notifyAccountsChanged,
    requestAccountsPermission,
  } = services;
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
      accounts: [mockAddress],
      chainId: '0x1',
      isUnlocked: true,
      networkVersion: '1',
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
    res.result = [];
    // await requestAccountsPermission(); // wallet_requestPermissions
    res.result = [mockAddress];
    return;
  }

  if (method === 'cfx_accounts') {
    res.result = [mockAddress];
    return;
  }

  // chain method ----------------------------------------------
  // - eth_blockNumber
  // - eth_epochNumber
  // - eth_call
  // - net_version

  console.log('RPC handleDappMethods', req);
}

export default {
  handleDappMethods,
};
