import url from 'url';
import { createAsyncMiddleware } from '@onekeyhq/json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { isString } from 'lodash';
import utilsUrl from '../../../../../src/utils/utilsUrl';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../../../../ui/app/helpers/constants/common';

const RETRIABLE_ERRORS = [
  // ignore server overload errors
  'Gateway timeout',
  'ETIMEDOUT',
  // ignore server sent html error pages
  // or truncated json responses
  'failed to parse response body',
  // ignore errors where http req failed to establish
  'Failed to fetch',
  'JSON-RPC Error: Response has no result for request',
  'missing trie node',
  'header not found',
  'request rate limited',
  'limit exceeded',
  'TypeError: NetworkError when attempting to fetch resource.',
];

function getFallbackUrl(defaultUrl, count, fallbackUrls) {
  if (
    count === 0 ||
    !fallbackUrls ||
    !Array.isArray(fallbackUrls) ||
    fallbackUrls.length === 0
  ) {
    return defaultUrl;
  }
  const i = (count - 1) % fallbackUrls.length;
  const fallback = fallbackUrls[i];
  if (typeof fallback === 'string') {
    return fallback;
  }
  return defaultUrl;
}

export function createFetchMiddleware({
  rpcUrl,
  originHttpHeaderKey,
  fallbackUrls,
}) {
  return createAsyncMiddleware(async (req, res, next) => {
    // attempt request multiple times
    const maxAttempts = 8;
    const retryInterval = 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const rUrl = getFallbackUrl(rpcUrl, attempt, fallbackUrls);
        const { fetchUrl, fetchParams } = createFetchConfigFromReq({
          req,
          rpcUrl: rUrl,
          originHttpHeaderKey,
        });

        let fetchUrlWithQuery = fetchUrl;
        if (
          process.env.ENV_ADD_RPC_PARAMS_QUERY &&
          req.method &&
          isString(req.method)
        ) {
          // celo RPC will fail if change url
          //  Infura Client:
          //    node_modules/eth-json-rpc-infura/src/index.js
          //      fetchUrl: `https://${network}.infura.io/v3/${projectId}`,
          fetchUrlWithQuery = utilsUrl.addQuery({
            url: fetchUrl,
            query: { method: req.method, appendFetchParamsInUrl: true },
          });
        }

        const fetchRes = await window.fetch(fetchUrlWithQuery, fetchParams);
        // check for http errrors
        checkForHttpErrors(fetchRes);
        // parse response body
        const rawBody = await fetchRes.text();
        let fetchBody;
        try {
          fetchBody = JSON.parse(rawBody);
        } catch (_) {
          throw new Error(
            `FetchMiddleware - failed to parse response body: "${rawBody}"`,
          );
        }
        const result = parseResponse(fetchRes, fetchBody);
        // set result and exit retry loop
        res.result = result;
        return;
      } catch (err) {
        const errMsg = err.toString();
        const isRetriable = RETRIABLE_ERRORS.some((phrase) =>
          errMsg.includes(phrase),
        );
        // re-throw error if not retriable
        if (!isRetriable) {
          if (err) {
            // RPC network error ignore
            err.ignoreBackgroundErrorNotification = true;
          }
          throw err;
        }
      }
      // delay before retrying
      await timeout(retryInterval);
    }
  });
}

function checkForHttpErrors(fetchRes) {
  // check for errors
  switch (fetchRes.status) {
    case 405:
      throw ethErrors.rpc.methodNotFound();

    case 418:
      throw createRatelimitError();

    case 503:
    case 504:
      throw createTimeoutError();
    default:
  }
}

function parseResponse(fetchRes, body) {
  // check for error code
  if (fetchRes.status !== 200) {
    throw ethErrors.rpc.internal({
      message: `Non-200 status code: '${fetchRes.status}'`,
      data: body,
    });
  }

  // check for rpc error
  if (body.error) {
    throw ethErrors.rpc.internal({
      message: body.error.message,
      data: body.error,
    });
  }

  // "body.result === null" is a valid response
  if (body.result === undefined) {
    throw ethErrors.rpc.internal({
      message:
        'JSON-RPC Error: Response has no result for request (OneKey.fetch) ',
      data: body,
    });
  }
  // return successful result
  return body.result;
}

function createFetchConfigFromReq({ req, rpcUrl, originHttpHeaderKey }) {
  // eslint-disable-next-line
  const parsedUrl = url.parse(rpcUrl);
  const fetchUrl = normalizeUrlFromParsed(parsedUrl);

  // prepare payload
  // copy only canonical json rpc properties
  const payload = {
    id: req.id,
    jsonrpc: req.jsonrpc,
    method: req.method,
    params: req.params,
  };

  // extract 'origin' parameter from request
  const originDomain = req.origin;

  // serialize request body
  const serializedPayload = JSON.stringify(payload);

  // configure fetch params
  const fetchParams = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: serializedPayload,
  };

  // encoded auth details as header (not allowed in fetch url)
  if (parsedUrl.auth) {
    const encodedAuth = window.btoa(parsedUrl.auth);
    fetchParams.headers.Authorization = `Basic ${encodedAuth}`;
  }

  // optional: add request origin as header
  if (originHttpHeaderKey && originDomain) {
    fetchParams.headers[originHttpHeaderKey] = originDomain;
  }

  return { fetchUrl, fetchParams };
}

function normalizeUrlFromParsed(parsedUrl) {
  let result = '';
  result += parsedUrl.protocol;
  if (parsedUrl.slashes) {
    result += '//';
  }
  result += parsedUrl.hostname;
  if (parsedUrl.port) {
    result += `:${parsedUrl.port}`;
  }
  result += `${parsedUrl.path}`;
  return result;
}

function createRatelimitError() {
  return ethErrors.rpc.internal({ message: `Request is being rate limited.` });
}

function createTimeoutError() {
  let msg = `Gateway timeout. The request took too long to process. `;
  msg += `This can happen when querying logs over too wide a block range.`;
  return ethErrors.rpc.internal({ message: msg });
}

function timeout(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
