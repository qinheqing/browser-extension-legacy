// - https://github.com/project-serum/sol-wallet-adapter#usage
// - https://docs.phantom.app/
// check usage: kermit.exchange/static/js/utils/wallet.tsx
/*
import SolWalletAdapter from '@project-serum/sol-wallet-adapter';

const wallet = new SolWalletAdapter(window.sollet, network); // sollet injected: window.sollet
const wallet = window.solana; // phantom injected: window.solana

// solletAdapter only
wallet.connected = true;
wallet.sign(); // sign text
wallet.isInjectedProvider();

// both phantom and solletAdapter include
wallet.on('connect');
wallet.publicKey.toBase58();
wallet.on('disconnect');
wallet.disconnect();
wallet.connect();
wallet.signTransaction(transaction);
wallet.signAllTransactions(transactionsAndSigners);
wallet.autoApprove = true;

// phantom only
wallet.isPhantom = true;
wallet.isConnected = true;
wallet.request(); // low level method
wallet.openBridge(); // low level method
wallet.postMessage(); // low level method
solana.listeners('disconnect')

// check sign, signTransaction, signAllTransactions at sollet PopupPage.js

 */

import { CONST_DAPP_MESSAGE_TYPES } from '../../../../consts/consts';

function init() {
  window.sollet = {
    isOneKey: true,
    isSollet: true,

    postMessage: (message) => {
      /*
      sol-wallet-adapter call disconnect() at beforeunload event
          window.addEventListener('beforeunload', this.disconnect.bind(this));
       */
      console.log('RPC (Dapp -> Ext)', message);
      const listener = (event) => {
        // check event from origin, source, target for safety
        if (event.target !== window) {
          return;
        }

        if (event.detail.id === message.id) {
          window.removeEventListener(
            CONST_DAPP_MESSAGE_TYPES.EVENT_CONTENT_TO_INPAGE,
            listener,
          );
          // send message to dapp (sol-wallet-adapter)
          // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L65
          window.postMessage(event.detail);
        }
      };
      window.addEventListener(
        CONST_DAPP_MESSAGE_TYPES.EVENT_CONTENT_TO_INPAGE,
        listener,
      );

      window.dispatchEvent(
        new window.CustomEvent(
          // sollet_injected_script_message
          CONST_DAPP_MESSAGE_TYPES.EVENT_INPAGE_TO_CONTENT,
          {
            detail: message,
          },
        ),
      );
    },
  };
}

export default {
  init,
};
