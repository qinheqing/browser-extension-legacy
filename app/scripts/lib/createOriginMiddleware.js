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
    req.streamName = opts.streamName;
    res.streamName = opts.streamName;
    next();
  };
}
