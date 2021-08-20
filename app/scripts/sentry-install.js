import setupSentry from './lib/setupSentry';

// only setup sentry in production env
if (process.env.NODE_ENV === 'production') {
  // setup sentry error reporting
  global.sentry = setupSentry({
    release: process.env.METAMASK_VERSION,
    getState: () => global.getSentryState?.() || {},
  });
}
