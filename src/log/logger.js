import log from 'loglevel';

global.$$logger = log;

// [setDefaultLevel] and [setLevel] will save [loglevel] to localStorage.
log.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn');
// log.setLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn');

// levels:  ["trace", "debug", "info", "warn", "error"]

export default log;
