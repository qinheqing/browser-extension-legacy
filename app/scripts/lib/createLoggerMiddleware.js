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
    next((/** @type {Function} */ cb) => {
      if (res.error) {
        // https://sentry.io/organizations/onekey_hq/issues/2296866142
        //    this log will send to sentry, display error object directly
        log.error('Error in RPC response >>> \n', res.error);
      }
      if (req.isMetamaskInternal) {
        return;
      }
      log.info(`RPC (${opts.origin}):`, req, '->', res);
      cb();
    });
  };
}
