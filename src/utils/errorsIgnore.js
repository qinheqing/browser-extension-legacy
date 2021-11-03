// https://docs.sentry.io/platforms/javascript/configuration/filtering/#using-beforesend
// https://docs.sentry.io/clients/javascript/config/ ignoreErrors, ignoreUrls
import { endsWith, startsWith } from 'lodash';

const Wildcard = '****';

const sentryIgnoreRules = [
  // https://sentry.io/organizations/onekey_hq/issues/2607470869/
  ['Incorrect password', ['unlockKeyrings', 'submitPassword']],
  // https://sentry.io/organizations/onekey_hq/issues/2644291921/
  ['The method does not exist / is not available.'],
  // https://sentry.io/organizations/onekey_hq/issues/2583815598/
  ['Popup closed'],
  // https://sentry.io/organizations/onekey_hq/issues/2291320873/
  ['Segment page tracking found unmatched route'],
  // https://sentry.io/organizations/onekey_hq/issues/2607487371/
  [`Non-200 status code: '404'`],
  [`Non-200 status code: '403'`],
  // https://sentry.io/organizations/onekey_hq/issues/2650629732/
  [`ProtocolError is not defined`],
  // https://sentry.io/organizations/onekey_hq/issues/2650291701/
  [`unsupported block number ****`, ['getEthJsonRpcError']],
  [`BlockReEmitMiddleware - retries exhausted`],
  [`wrong previous session`],
  [`Iframe timeout`],
  [`Error: Iframe timeout`],
];

function parseSentryReport({ report }) {
  const message = report?.exception?.values?.[0]?.value || '';
  const functions =
    report?.exception?.values?.[0]?.stacktrace?.frames?.map(
      (item) => item.function,
    ) || [];
  const length = report?.exception?.values?.length || 0;
  return {
    message,
    functions,
    length,
  };
}

function isRuleMatch({ rule, message, functions, length }) {
  if (length > 1) {
    return false;
  }
  const [ruleMsg, ruleFuncName] = rule;
  let isMatch = false;
  if (ruleMsg) {
    const startWildcard = startsWith(ruleMsg, Wildcard);
    const endWildcard = endsWith(ruleMsg, Wildcard);
    const pureStr = ruleMsg.replace(Wildcard, '').replace(Wildcard, '');
    if (startWildcard && endWildcard) {
      isMatch = message && message.includes(ruleMsg);
    } else if (startWildcard) {
      isMatch = message && endsWith(message, pureStr);
    } else if (endWildcard) {
      isMatch = message && startsWith(message, pureStr);
    } else if (message === ruleMsg) {
      isMatch = true;
    }
  }

  if (ruleFuncName) {
    const ruleFuncNames = [].concat(ruleFuncName || '');
    const functionsStr = (functions || []).join(' ');
    ruleFuncNames.forEach((name) => {
      const funcNameMatch = name && functionsStr && functionsStr.includes(name);
      isMatch = isMatch && funcNameMatch;
    });
  }
  return isMatch;
}

// eslint-disable-next-line node/handle-callback-err
function ignoreSentry(report) {
  const ignoreRules = window.__SENTRY_IGNORE_RULES__ || sentryIgnoreRules;
  const { message, functions, length } = parseSentryReport({ report });
  for (let i = 0; i < ignoreRules.length; i++) {
    const rule = ignoreRules[i] || [];
    if (
      isRuleMatch({
        rule,
        message,
        functions,
        length,
      })
    ) {
      console.log('ignore sentry error', rule);
      return true;
    }
  }

  return false;
}

function ignoreNotification() {
  // err.ignoreBackgroundErrorNotification = true;
}

export default { ignoreSentry };
