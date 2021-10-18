import setupSentry from './lib/setupSentry';

// only setup sentry in production env
if (process.env.NODE_ENV === 'production' || process.env.SENTRY_DSN_DEV) {
  // setup sentry error reporting
  global.sentry = setupSentry({
    release: process.env.METAMASK_VERSION,
    // getSentryState() only works in UI thread
    getState: () => global.getSentryState?.() || {},
  });
}
