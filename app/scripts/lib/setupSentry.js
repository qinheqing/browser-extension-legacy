import * as Sentry from '@sentry/browser';
import { Dedupe, ExtraErrorData } from '@sentry/integrations';
import { Integrations } from '@sentry/tracing';
import * as uuid from 'uuid';
import errorsIgnore from '../../../src/utils/errorsIgnore';
import extractEthjsErrorMessage from './extractEthjsErrorMessage';

/* eslint-disable prefer-destructuring */
// Destructuring breaks the inlining of the environment variables
const METAMASK_DEBUG = process.env.METAMASK_DEBUG;
const METAMASK_ENVIRONMENT = process.env.METAMASK_ENVIRONMENT;
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_DSN_DEV = process.env.SENTRY_DSN_DEV;

// This describes the subset of Redux state attached to errors sent to Sentry
// These properties have some potential to be useful for debugging, and they do
// not contain any identifiable information.
export const SENTRY_STATE = {
  gas: true,
  history: true,
  metamask: {
    alertEnabledness: true,
    completedOnboarding: true,
    connectedStatusPopoverHasBeenShown: true,
    conversionDate: true,
    conversionRate: true,
    currentBlockGasLimit: true,
    currentCurrency: true,
    currentLocale: true,
    customNonceValue: true,
    defaultHomeActiveTabName: true,
    featureFlags: true,
    firstTimeFlowType: true,
    forgottenPassword: true,
    incomingTxLastFetchedBlocksByNetwork: true,
    ipfsGateway: true,
    isAccountMenuOpen: true,
    isInitialized: true,
    isUnlocked: true,
    nativeCurrency: true,
    network: true,
    nextNonce: true,
    preferences: true,
    provider: {
      nickname: true,
      ticker: true,
      type: true,
    },
    seedPhraseBackedUp: true,
    showRestorePrompt: true,
    unapprovedDecryptMsgCount: true,
    unapprovedEncryptionPublicKeyMsgCount: true,
    unapprovedMsgCount: true,
    unapprovedPersonalMsgCount: true,
    unapprovedTypedMessagesCount: true,
    useBlockie: true,
    useNonceField: true,
    usePhishDetect: true,
    welcomeScreenSeen: true,
  },
  unconnectedAccount: true,
};

export default function setupSentry({ release, getState }) {
  let sentryTarget;

  if (METAMASK_DEBUG) {
    if (!SENTRY_DSN_DEV) {
      throw new Error(
        `Missing SENTRY_DSN_DEV environment variable in development environment`,
      );
    }

    console.log(
      `Setting up Sentry Remote Error Reporting for '${METAMASK_ENVIRONMENT}': SENTRY_DSN_DEV`,
    );
    sentryTarget = SENTRY_DSN_DEV;
  } else if (METAMASK_ENVIRONMENT === 'production') {
    if (!SENTRY_DSN) {
      throw new Error(
        `Missing SENTRY_DSN environment variable in production environment`,
      );
    }

    console.log(
      `Setting up Sentry Remote Error Reporting for '${METAMASK_ENVIRONMENT}': SENTRY_DSN`,
    );
    sentryTarget = SENTRY_DSN;
  }

  sentryTarget = sentryTarget || SENTRY_DSN || SENTRY_DSN_DEV;
  if (!sentryTarget) {
    throw new Error(
      `Missing SENTRY_DSN environment variable in production environment`,
    );
  }

  Sentry.init({
    dsn: sentryTarget,
    debug: METAMASK_DEBUG,
    environment: METAMASK_ENVIRONMENT,
    integrations: [
      new Dedupe(),
      new ExtraErrorData(),
      new Integrations.BrowserTracing(),
    ],
    release,
    // https://docs.sentry.io/platforms/javascript/configuration/filtering/#using-beforesend
    beforeSend: (report) => rewriteReport(report),
    // Setup Apdex
    tracesSampleRate: METAMASK_DEBUG ? 1.0 : 0.2,
  });

  // https://docs.sentry.io/platforms/javascript/enriching-events/identify-user/
  Sentry.setUser({
    id: getOrCreateSentryUserId(),
    // ip_address: '{{auto}}',
  });

  function rewriteReport(report) {
    try {
      // simplify certain complex error messages (e.g. Ethjs)
      simplifyErrorMessages(report);
      // modify report urls
      rewriteReportUrls(report);
      // append app state
      if (getState) {
        const appState = getState();
        if (!report.extra) {
          report.extra = {};
        }
        report.extra.appState = appState;
      }

      if (errorsIgnore.ignoreSentry(report)) {
        return null;
      }
    } catch (err) {
      console.warn(err);
    }
    return report;
  }

  return Sentry;
}

function simplifyErrorMessages(report) {
  rewriteErrorMessages(report, (errorMessage) => {
    // simplify ethjs error messages
    let simplifiedErrorMessage = extractEthjsErrorMessage(errorMessage);
    // simplify 'Transaction Failed: known transaction'
    if (
      simplifiedErrorMessage.indexOf(
        'Transaction Failed: known transaction',
      ) === 0
    ) {
      // cut the hash from the error message
      simplifiedErrorMessage = 'Transaction Failed: known transaction';
    }
    return simplifiedErrorMessage;
  });
}

function rewriteErrorMessages(report, rewriteFn) {
  // rewrite top level message
  if (typeof report.message === 'string') {
    report.message = rewriteFn(report.message);
  }

  // rewrite each exception message
  if (report.exception && report.exception.values) {
    report.exception.values.forEach((item) => {
      if (typeof item.value === 'string') {
        item.value = rewriteFn(item.value);
      }
    });
  }
}

function rewriteReportUrls(report) {
  // update request url
  report.request.url = toMetamaskUrl(report.request.url);
  // update exception stack trace
  if (report.exception && report.exception.values) {
    report.exception.values.forEach((item) => {
      if (item.stacktrace) {
        item.stacktrace.frames.forEach((frame) => {
          frame.filename = toMetamaskUrl(frame.filename);
        });
      }
    });
  }
}

function toMetamaskUrl(origUrl) {
  const filePath = origUrl.split(window.location.origin)[1];
  if (!filePath) {
    return origUrl;
  }
  const metamaskUrl = `metamask${filePath}`;
  return metamaskUrl;
}

function getOrCreateSentryUserId() {
  try {
    const key = 'ONEKEY_SENTRY_USER_ID';
    let id = localStorage.getItem(key);
    if (!id) {
      id = uuid.v4();
      localStorage.setItem(key, id);
    }
    return id;
  } catch (ex) {
    return undefined;
  }
}
