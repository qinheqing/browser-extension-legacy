import { CONST_DAPP_MESSAGE_TYPES } from '../../../../consts/consts';

function init() {
  window.addEventListener(
    CONST_DAPP_MESSAGE_TYPES.INPAGE_TO_CONTENT,
    (event) => {
      // TODO only chrome
      window.chrome.runtime.sendMessage(
        {
          channel: CONST_DAPP_MESSAGE_TYPES.CONTENT_TO_BG,
          data: event.detail,
        },
        // response message from bg to content
        // Send message to content -> inpage -> dapp(sol-wallet-adapter)
        (response) => {
          console.log('RPC (Ext -> Dapp)', response);
          // Can return null response if window is killed
          if (!response) {
            return;
          }
          window.dispatchEvent(
            new CustomEvent(CONST_DAPP_MESSAGE_TYPES.CONTENT_TO_INPAGE, {
              detail: response,
            }),
          );
        },
      );
    },
  );
}

export default {
  init,
};
