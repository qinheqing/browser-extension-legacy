import extension from 'extensionizer';
import { CONST_DAPP_MESSAGE_TYPES } from '../../../../consts/consts';
import DappMessageSOL from './DappMessageSOL';

function init() {
  window.addEventListener(
    CONST_DAPP_MESSAGE_TYPES.EVENT_INPAGE_TO_CONTENT,
    (event) => {
      // check event from origin, source, target for safety
      if (event.target !== window) {
        return;
      }

      // TODO only chrome
      extension.runtime.sendMessage(
        DappMessageSOL.extensionRuntimeMessage({
          channel: CONST_DAPP_MESSAGE_TYPES.CHANNEL_CONTENT_TO_BG,
          data: event.detail,
        }),
        // response message from bg to content
        // Send message to content -> inpage -> dapp(sol-wallet-adapter)
        (response) => {
          console.log('RPC (Ext -> Dapp)', response);
          // Can return null response if window is killed
          if (!response) {
            return;
          }

          window.dispatchEvent(
            new CustomEvent(CONST_DAPP_MESSAGE_TYPES.EVENT_CONTENT_TO_INPAGE, {
              // FireFox: event.detail can not be Object, only String supported
              //    Uncaught Error: Permission denied to access property "id"
              detail: JSON.stringify(response),
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
