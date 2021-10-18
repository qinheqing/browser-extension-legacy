/**
 * Returns a middleware that appends the DApp origin to request
 * @param {{ origin: string }} opts - The middleware options
 * @returns {Function}
 */
export default function createOriginMiddleware(opts) {
  return function originMiddleware(
    /** @type {any} */ req,
    /** @type {any} */ res,
    /** @type {Function} */ next,
  ) {
    req.origin = opts.origin;
    req.location = opts.location;

    req.streamName = req.streamName || opts.streamName;
    req.baseChain = req.baseChain || opts.baseChain;

    res.streamName = res.streamName || opts.streamName;
    res.baseChain = res.baseChain || opts.baseChain;

    next();
  };
}
