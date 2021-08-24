import logger from 'loglevel';

global.$$logger = logger;

// [setDefaultLevel] and [setLevel] will save [loglevel] to localStorage.
logger.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn');

// log.setLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn');

// levels:  ["trace", "debug", "info", "warn", "error"]

export default logger;
