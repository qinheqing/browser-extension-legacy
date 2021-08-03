const lodash = require('lodash');
const packageJSON = require('../../package.json');

const allDependencies = Object.keys(
  (packageJSON && packageJSON.dependencies) || {},
);

const ignoreDeps = ['tailwindcss', 'readable-stream'];
const commonDeps = ['lodash', 'mobx', 'mobx-react-lite'];
const reactDeps = allDependencies.filter((dep) => dep.match(/react/u));
const onekeyDeps = [
  '@material-ui/core',
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
  // '@metamask/contract-metadata',
  // '@metamask/controllers',
  // '@metamask/eth-token-tracker',
  // '@metamask/inpage-provider',
  // '@metamask/jazzicon',
  // '@metamask/logo',
  // '@metamask/obs-store',
];

const externalLibs = filterAvailableDeps([
  ...commonDeps,
  // ...reactDeps,
  // ...onekeyDeps,
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
