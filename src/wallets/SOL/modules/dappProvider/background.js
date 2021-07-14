import { CONST_DAPP_MESSAGE_TYPES } from '../../../../consts/consts';
import OneDappMessage from '../../../../classes/OneDappMessage';

const responseHandlers = new Map();
let unlockedMnemonic = '';

function launchPopup(message, sender, sendResponse) {
  const searchParams = new URLSearchParams();
  searchParams.set('origin', sender.origin);
  searchParams.set('network', message.data.params.network);
  searchParams.set('request', JSON.stringify(message.data));

  // TODO consolidate popup dimensions
  window.chrome.windows.getLastFocused((focusedWindow) => {
    window.chrome.windows.create({
      url: `notification.html#app/approve-popup/?${searchParams.toString()}`,
      type: 'popup',
      width: 360,
      height: 600,
      top: focusedWindow.top,
      left: focusedWindow.left + (focusedWindow.width - 375),
      setSelfAsOpener: true,
      focused: true,
    });
  });

  responseHandlers.set(message.data.id, sendResponse);
}

function handleConnect(message, sender, sendResponse) {
  window.chrome.storage.local.get('connectedWallets', (result) => {
    const connectedWallet = (result.connectedWallets || {})[sender.origin];
    // eslint-disable-next-line no-negated-condition
    if (!connectedWallet) {
      launchPopup(message, sender, sendResponse);
    } else {
      // Send message to content -> inpage -> dapp(sol-wallet-adapter)
      sendResponse(
        OneDappMessage.connectedMessage({
          id: message.data.id,
          params: {
            publicKey: connectedWallet.publicKey,
            autoApprove: connectedWallet.autoApprove,
          },
        }),
      );
    }
  });
}

function handleDisconnect(message, sender, sendResponse) {
  window.chrome.storage.local.get('connectedWallets', (result) => {
    delete result.connectedWallets[sender.origin];
    window.chrome.storage.local.set(
      {
        connectedWallets: result.connectedWallets,
        lastUpdateStorageTime: `${new Date().toString()}/background.js`,
      },
      () =>
        sendResponse(
          OneDappMessage.disconnectedMessage({
            id: message.data.id,
          }),
        ),
    );
  });
}

function init() {
  window.chrome.runtime.onMessage.addListener(
    // eslint-disable-next-line consistent-return
    (message, sender, _sendResponse) => {
      console.log('RPC (Dapp <-> Ext)', message, sender);
      const sendResponse = (...params) => {
        console.log('RPC (Ext -> Dapp)', ...params);
        _sendResponse(...params);
      };

      if (message.channel === CONST_DAPP_MESSAGE_TYPES.CHANNEL_CONTENT_TO_BG) {
        if (message.data.method === 'connect') {
          handleConnect(message, sender, sendResponse);
        } else if (message.data.method === 'disconnect') {
          handleDisconnect(message, sender, sendResponse);
        } else {
          launchPopup(message, sender, sendResponse);
        }
        // keeps response channel open
        return true;
      } else if (
        message.channel === CONST_DAPP_MESSAGE_TYPES.CHANNEL_POPUP_TO_BG
      ) {
        const responseHandler = responseHandlers.get(message.data.id);
        responseHandlers.delete(message.data.id);
        responseHandler(message.data);
      } else if (
        message.channel ===
        CONST_DAPP_MESSAGE_TYPES.CHANNEL_POPUP_TO_BG_MNEMONIC
      ) {
        if (message.method === 'set') {
          unlockedMnemonic = message.data;
        } else if (message.method === 'get') {
          sendResponse(unlockedMnemonic);
        }
      }
    },
  );
}

export default {
  init,
};
