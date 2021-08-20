// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
let __define;

/**
 * Caches reference to global define object and deletes it to
 * avoid conflicts with other global define objects, such as
 * AMD's define function
 */
const cleanContextForImports = () => {
  __define = global.define;
  try {
    global.define = undefined;
  } catch (_) {
    console.warn('MetaMask - global.define could not be deleted.');
  }
};

/**
 * Restores global define object from cached reference
 */
const restoreContextAfterImports = () => {
  try {
    global.define = __define;
  } catch (_) {
    console.warn('MetaMask - global.define could not be overwritten.');
  }
};

cleanContextForImports();

/* eslint-disable import/first */
import { WindowPostMessageStream } from '@onekeyhq/post-message-stream';
import { initializeProvider } from '@onekeyhq/providers';
import log from '../../src/log/logger';
import inpageSolana from '../../src/wallets/SOL/modules/dappProvider/inpage';
// import inpageSolanaLegacy from '../../src/wallets/SOL/modules/dappProvider/inpageSolanaLegacy';

restoreContextAfterImports();

//
// setup plugin communication
//

// setup background connection
const metamaskStream = new WindowPostMessageStream({
  name: 'onekey-inpage',
  target: 'onekey-contentscript',
});

initializeProvider({
  connectionStream: metamaskStream,
  jsonRpcStreamName: 'onekey-provider',
  logger: log,
  shouldShimWeb3: true,
});

inpageSolana.init();
// inpageSolanaLegacy.init();
