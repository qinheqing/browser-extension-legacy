import querystring from 'querystring';
import pump from 'pump';
import { WindowPostMessageStream } from '@onekeyhq/post-message-stream';
import ObjectMultiplex from 'obj-multiplex';
import extension from 'extensionizer';
import PortStream from 'extension-port-stream';
import contentscriptSolana from '../../src/wallets/providers/SOL/dapp/contentscript';
import utilsVersion from '../../src/utils/utilsVersion';
import {
  STREAM_CONTENT_SCRIPT,
  STREAM_INPAGE,
  STREAM_PROVIDER_ETH,
  STREAM_PROVIDER_CFX,
} from './constants/consts';
// import { obj as createThoughStream } from 'through2';

// These require calls need to use require to be statically recognized by browserify
const fs = require('fs');
const path = require('path');

const inpageContent = fs.readFileSync(
  path.join(__dirname, '..', '..', 'dist', 'chrome', 'inpage.js'),
  'utf8',
);
const inpageSuffix = `//# sourceURL=${extension.runtime.getURL('inpage.js')}\n`;
const inpageBundle = inpageContent + inpageSuffix;

// TODO:LegacyProvider: Delete
const LEGACY_CONTENT_SCRIPT = 'contentscript';
const LEGACY_INPAGE = 'inpage';
const LEGACY_PROVIDER = 'provider';
const LEGACY_PUBLIC_CONFIG = 'publicConfig';

if (shouldInjectProvider()) {
  const versionInfo = utilsVersion.getVersionInfo();
  injectScript(`window.onekeyAppVersionInfo = ${JSON.stringify(versionInfo)};`);
  injectScript(inpageBundle);
  setupStreams();
}

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript(content) {
  try {
    const container =
      document.head || document.body || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.textContent = content;
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error('MetaMask: Provider injection failed.', error);
  }
}

/**
 * Sets up two-way communication streams between the
 * browser extension and local per-page browser context.
 *
 */
async function setupStreams() {
  // the transport-specific streams for communication between inpage and background
  const pageStream = new WindowPostMessageStream({
    name: STREAM_CONTENT_SCRIPT,
    target: STREAM_INPAGE,
  });
  const extensionPort = extension.runtime.connect({
    name: STREAM_CONTENT_SCRIPT,
  });
  const extensionStream = new PortStream(extensionPort);

  // create and connect channel muxers
  // so we can handle the channels individually
  const pageMux = new ObjectMultiplex();
  pageMux.setMaxListeners(25);
  const extensionMux = new ObjectMultiplex();
  extensionMux.setMaxListeners(25);
  extensionMux.ignoreStream(LEGACY_PUBLIC_CONFIG); // TODO:LegacyProvider: Delete

  pump(pageMux, pageStream, pageMux, (err) =>
    logStreamDisconnectWarning('MetaMask Inpage Multiplex', err),
  );

  pump(extensionMux, extensionStream, extensionMux, (err) => {
    logStreamDisconnectWarning('MetaMask Background Multiplex', err);
    notifyInpageOfStreamFailure();
  });

  // forward communication across inpage-background for these channels only
  forwardTrafficBetweenMuxes(STREAM_PROVIDER_ETH, pageMux, extensionMux);
  forwardTrafficBetweenMuxes(STREAM_PROVIDER_CFX, pageMux, extensionMux);

  // connect "phishing" channel to warning system
  const phishingStream = extensionMux.createStream('phishing');
  phishingStream.once('data', redirectToPhishingWarning);
}

function forwardTrafficBetweenMuxes(channelName, muxA, muxB) {
  const channelA = muxA.createStream(channelName);
  const channelB = muxB.createStream(channelName);
  pump(channelA, channelB, channelA, (error) =>
    console.debug(
      `MetaMask: Muxed traffic for channel "${channelName}" failed.`,
      error,
    ),
  );
}

/**
 * Error handler for page to extension stream disconnections
 *
 * @param {string} remoteLabel - Remote stream name
 * @param {Error} error - Stream connection error
 */
function logStreamDisconnectWarning(remoteLabel, error) {
  console.debug(
    `MetaMask: Content script lost connection to "${remoteLabel}".`,
    error,
  );
}

function _notifyInpageOfStreamFailureForProvider(name) {
  window.postMessage(
    {
      target: STREAM_INPAGE, // the post-message-stream "target"
      data: {
        // this object gets passed to obj-multiplex
        name, // the obj-multiplex channel name
        data: {
          jsonrpc: '2.0',
          method: 'METAMASK_STREAM_FAILURE',
        },
      },
    },
    window.location.origin,
  );
}

/**
 * This function must ONLY be called in pump destruction/close callbacks.
 * Notifies the inpage context that streams have failed, via window.postMessage.
 * Relies on obj-multiplex and post-message-stream implementation details.
 */
function notifyInpageOfStreamFailure() {
  _notifyInpageOfStreamFailureForProvider(STREAM_PROVIDER_ETH);
  _notifyInpageOfStreamFailureForProvider(STREAM_PROVIDER_CFX);
}

/**
 * Determines if the provider should be injected
 *
 * @returns {boolean} {@code true} Whether the provider should be injected
 */
function shouldInjectProvider() {
  return (
    doctypeCheck() &&
    suffixCheck() &&
    documentElementCheck() &&
    !blockedDomainCheck()
  );
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} if the doctype is html or if none exists
 */
function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * @returns {boolean} whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

/**
 * Checks if the current domain is blocked
 *
 * @returns {boolean} {@code true} if the current domain is blocked
 */
function blockedDomainCheck() {
  const blockedDomains = [
    'uscourts.gov',
    'dropbox.com',
    'webbyawards.com',
    'cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html',
    'adyen.com',
    'gravityforms.com',
    'harbourair.com',
    'ani.gamer.com.tw',
    'blueskybooking.com',
    'sharefile.com',
  ];
  const currentUrl = window.location.href;
  let currentRegex;
  for (let i = 0; i < blockedDomains.length; i++) {
    const blockedDomain = blockedDomains[i].replace('.', '\\.');
    currentRegex = new RegExp(
      `(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`,
      'u',
    );

    if (!currentRegex.test(currentUrl)) {
      return true;
    }
  }
  return false;
}

/**
 * Redirects the current page to a phishing information page
 */
function redirectToPhishingWarning({ currentLocale = 'zh' } = {}) {
  console.debug('MetaMask: Routing to Phishing Warning component.');
  const filename = currentLocale.includes('en')
    ? 'phishing_en.html'
    : 'phishing.html';
  const extensionURL = extension.runtime.getURL(filename);
  window.location.href = `${extensionURL}#${querystring.stringify({
    hostname: window.location.hostname,
    href: window.location.href,
  })}`;
}

// test on site:  window.postMessage({type: 'ONEKEY_PHISHING_WARNING'});
window.addEventListener('message', (event) => {
  const type = event?.data?.type;
  if (type === 'ONEKEY_PHISHING_WARNING') {
    redirectToPhishingWarning();
  }
});

contentscriptSolana.init();
