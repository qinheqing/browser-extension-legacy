const lodash = require('lodash');
const packageJSON = require('../../package.json');

const allDependencies = Object.keys(
  (packageJSON && packageJSON.dependencies) || {},
);

const ignoreDeps = [
  'mobx', // global standalone
  'mobx-react-lite', // global standalone
  '@solana/web3.js', // global standalone

  // * ignore modules below, cause background error ( only start by "yarn start-legacy" ):
  'tailwindcss', // Error: Parsing file /tailwindcss/lib/util/withAlphaVariable.js: Unexpected token
  'readable-stream', // Cannot find module '/readable-stream/readable-browser.js'
  'ethereumjs-wallet', // Cannot find module '/ethereumjs-wallet/index.js'
  'eth-json-rpc-infura', // Cannot find module '/eth-json-rpc-infura/src/index.js'
  'eth-json-rpc-filters', // Cannot find module '/eth-json-rpc-filters/index.js'
  'json-rpc-engine', // TypeError: JsonRpcEngine is not a constructor
  'ethereumjs-util', // ethUtil.keccak is not a function (first time on-boarding finished)
];
const commonDeps = ['lodash'];
const reactDeps = allDependencies.filter((dep) => dep.match(/react/u));
const onekeyDeps = [
  '3box',
  '@onekeyhq/eth-onekey-keyring ',
  '@formatjs/intl-relativetimeformat',
  '@solana/spl-token-registry',
  '@ensdomains/content-hash',
  '@material-ui/core',
  'ethers',
  'eth-keyring-controller',
  // 'ethjs',
  // 'ethjs-ens',
  // 'web3',
  // 'ethjs-contract',
  // 'eth-block-tracker',
  // 'eth-ens-namehash',
  // 'eth-json-rpc-filters',
  // 'eth-json-rpc-infura',
  // 'eth-json-rpc-middleware',
  // 'eth-keyring-controller',
  // 'eth-method-registry',
  // 'eth-phishing-detect',
  // 'eth-query',
  // 'eth-rpc-errors',
  // 'ethers',
  // 'json-rpc-engine',
  // 'json-rpc-middleware-stream',
  // 'safe-event-emitter',
  // 'rpc-cap',
  // 'ethereumjs-wallet',
  // '@zxing/library',
  // '@formatjs/intl-relativetimeformat',
  // '@onekeyhq/eth-onekey-keyring',
  // '@onekeyhq/jazzicon',
  // '@onekeyhq/obs-store',
];

const externalLibs = filterAvailableDeps([
  ...commonDeps,
  ...reactDeps,
  ...onekeyDeps,
  ...allDependencies,
]);

// console.log('------ externalDependenciesMap -----');
// console.log(externalDependenciesMap);

function filterAvailableDeps(deps = []) {
  // return deps;
  return lodash.uniq(
    deps.filter(
      (item) => allDependencies.includes(item) && !ignoreDeps.includes(item),
    ),
  );
}

module.exports = externalLibs;
