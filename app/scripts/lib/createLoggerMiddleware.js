import log from 'loglevel';

/**
 * Returns a middleware that logs RPC activity
 * @param {{ origin: string }} opts - The middleware options
 * @returns {Function}
 */
export default function createLoggerMiddleware(opts) {
  return function loggerMiddleware(
    /** @type {any} */ req,
    /** @type {any} */ res,
    /** @type {Function} */ next,
  ) {
    // streamName, baseChain
    const reqMeta = ` ${opts.streamName}-${opts.baseChain} (${opts.origin}): ${opts.location} `;

    log.info(`DAPP_RPC [START] ${reqMeta}`, req);

    next((/** @type {Function} */ cb) => {
      if (res.error) {
        // https://sentry.io/organizations/onekey_hq/issues/2296866142
        //    this log will send to sentry, display error object directly
        log.error(`Error in RPC response ${reqMeta} >>> \n`, res.error);
      }

      log.info(`DAPP_RPC [END] ${reqMeta}`, req, '\r\n -> ', res);

      if (req.isMetamaskInternal) {
        return;
      }

      cb();
    });
  };
}
