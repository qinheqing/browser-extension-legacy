// Freezes all intrinsics
// Firefox:
//    - if run lockdown in promise
//        Uncaught Error: A case reducer on a non-draftable value must not return undefined
//    - mobx @observable.deep conflict, use [vendor/external-js/mobx.js]
//        Content Security Policy: The page’s settings blocked the loading of a resource at eval (“script-src”).
//    - mobx-react-lite use [app/vendor/mobx-react-lite.js]
//    - @solana/web3.js use [vendor/external-js/solana-web3.js]
//    - js-conflux-sdk use [js-conflux-sdk.umd.min.js]
//        js-conflux-sdk can not working new Conflux.CRC20()
//        (0 , l.default) is not a function
//        source code import not working:
//            Uncaught TypeError: Cannot add property BigInt, object is not extensible
//

// https://github.com/endojs/endo/blob/master/packages/ses/lockdown-options.md
function runLockDown() {
  // eslint-disable-next-line no-undef,import/unambiguous
  lockdown({
    consoleTaming: 'unsafe',
    errorTaming: 'unsafe',
    mathTaming: 'unsafe',
    dateTaming: 'unsafe',
    overrideTaming: 'severe',
  });
}

try {
  // https://github.com/MetaMask/metamask-extension/pull/9729
  // TODO disable runLockDown()
  //    js-conflux-sdk can not working new Conflux.CRC20()
  // runLockDown();
} catch (error) {
  // If the `lockdown` call throws an exception, it interferes with the
  // contentscript injection on some versions of Firefox. The error is
  // caught and logged here so that the contentscript still gets injected.
  // This affects Firefox v56 and Waterfox Classic
  console.error('Lockdown failed:', error);
  if (globalThis.sentry && globalThis.sentry.captureException) {
    globalThis.sentry.captureException(error);
  }
}
