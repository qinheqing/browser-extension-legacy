import { createAsyncMiddleware } from '@onekeyhq/json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import handlersCFX from 'wallets/providers/CFX/dapp/handlers';
import bgHelpers from '../../../../src/wallets/bg/bgHelpers';
import utilsApp from '../../../../src/utils/utilsApp';
import { STREAM_PROVIDER_CFX } from '../../constants/consts';

export const MOCK_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const MOCK_CHAIN_ID_WHEN_NEW_APP = {
  // chainId: "0x61"
  // networkVersion: "97"
  chainId: '0xEEEEEEEE',
  networkVersion: '4008636142',
};

function showBrowserNotification({ title, message, url }) {
  global.$$extensionPlatform?._showNotification(title, message, url);
}

/**
 * Create middleware for handling certain methods and preprocessing permissions requests.
 */
export default function createPermissionsMethodMiddleware({
  addDomainMetadata,
  getAccounts,
  getUnlockPromise,
  hasPermission,
  notifyAccountsChanged,
  requestAccountsPermission,
  ...others
}) {
  let isProcessingRequestAccounts = false;

  return createAsyncMiddleware(async (req, res, next) => {
    let responseHandler;

    if (utilsApp.isNewHome()) {
      if (req.method === 'eth_chainId') {
        res.result = MOCK_CHAIN_ID_WHEN_NEW_APP.chainId;
        return;
      }

      if (
        req.method === 'eth_requestAccounts' ||
        req.method === 'eth_accounts'
      ) {
        // pass getAccounts() to permissionsMethodMiddleware, can not be [], will cause UI ask to approve many times
        // res.result = [MOCK_ZERO_ADDRESS];
        res.result = [];
        if (req.method === 'eth_requestAccounts') {
          showBrowserNotification({
            title: `Chain network not matched`,
            message: `${req.method}`,
          });
        }
        return;
      }
    }

    if (req && req?.streamName === STREAM_PROVIDER_CFX) {
      const services = {
        addDomainMetadata,
        getAccounts,
        getUnlockPromise,
        hasPermission,
        notifyAccountsChanged,
        requestAccountsPermission,
        ...others,
      };
      console.log('DAPP_RPC createPermissionsMethodMiddleware', {
        method: req.method,
        req,
        services,
      });

      await handlersCFX.handleDappMethods({
        req,
        res,
        next,
        services,
      });
      return;
    }

    switch (req.method) {
      // Intercepting eth_accounts requests for backwards compatibility:
      // The getAccounts call below wraps the rpc-cap middleware, and returns
      // an empty array in case of errors (such as 4100:unauthorized)
      case 'eth_accounts': {
        res.result = await getAccounts();
        return;
      }

      case 'eth_requestAccounts': {
        if (isProcessingRequestAccounts) {
          res.error = ethErrors.rpc.resourceUnavailable(
            'Already processing eth_requestAccounts. Please wait.',
          );
          return;
        }

        // check if domain is approved
        if (hasPermission('eth_accounts')) {
          isProcessingRequestAccounts = true;
          await getUnlockPromise();
          isProcessingRequestAccounts = false;
        }

        // first, just try to get accounts
        let accounts = await getAccounts();
        if (accounts.length > 0) {
          res.result = accounts;
          return;
        }

        // if no accounts, request the accounts permission
        try {
          await requestAccountsPermission();
        } catch (err) {
          res.error = err;
          return;
        }

        // get the accounts again
        accounts = await getAccounts();
        /* istanbul ignore else: too hard to induce, see below comment */
        if (accounts.length > 0) {
          res.result = accounts;
        } else {
          // this should never happen, because it should be caught in the
          // above catch clause
          res.error = ethErrors.rpc.internal(
            'Accounts unexpectedly unavailable. Please report this bug.',
          );
        }

        return;
      }

      // custom method for getting metadata from the requesting domain,
      // sent automatically by the inpage provider when it's initialized
      case 'metamask_sendDomainMetadata': {
        if (typeof req.params?.name === 'string') {
          addDomainMetadata(req.origin, req.params);
        }
        res.result = true;
        return;
      }

      // register return handler to send accountsChanged notification
      case 'wallet_requestPermissions': {
        if ('eth_accounts' in req.params?.[0]) {
          responseHandler = async () => {
            if (Array.isArray(res.result)) {
              for (const permission of res.result) {
                if (permission.parentCapability === 'eth_accounts') {
                  notifyAccountsChanged(await getAccounts());
                }
              }
            }
          };
        }
        break;
      }

      default:
        break;
    }

    // when this promise resolves, the response is on its way back
    // eslint-disable-next-line node/callback-return
    await next();

    if (responseHandler) {
      responseHandler();
    }
  });
}
