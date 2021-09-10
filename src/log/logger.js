import logger from 'loglevel';

global.$$logger = logger;

// [setDefaultLevel] and [setLevel] will save [loglevel] to localStorage.
// logger.setLevel(process.env.METAMASK_DEBUG ? 'trace' : 'warn');
logger.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn');

// levels:  ["trace", "debug", "info", "warn", "error"]

export default logger;
