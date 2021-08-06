const dayjs = require('dayjs');

function currentTime() {
  return dayjs().format('HH:mm:ss');
}

console.logOriginal = console.log;
function log(...args) {
  // eslint-disable-next-line no-useless-call
  return console.logOriginal.call(console, `[${currentTime()}] ->`, ...args);
}

console.log = log;

module.exports = {
  log,
  currentTime,
};
