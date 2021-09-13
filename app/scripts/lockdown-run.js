// Freezes all intrinsics
// Firefox:
//    if run lockdown in promise
//      Uncaught Error: A case reducer on a non-draftable value must not return undefined
//    mobx @observable.deep conflict
//      Content Security Policy: The page’s settings blocked the loading of a resource at eval (“script-src”).
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
  // conflict with [js-conflux-sdk] Uncaught TypeError: Cannot add property BigInt, object is not extensible
  runLockDown();
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
