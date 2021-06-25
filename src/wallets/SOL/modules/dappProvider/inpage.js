// - https://github.com/project-serum/sol-wallet-adapter#usage
// check usage: kermit.exchange/static/js/utils/wallet.tsx
/*
import SolWalletAdapter from '@project-serum/sol-wallet-adapter';

const wallet = new SolWalletAdapter(window.sollet, network); // sollet injected: window.sollet
const wallet = window.solana; // phantom injected: window.solana

// solletAdapter only
wallet.connected;
wallet.sign();
wallet.isInjectedProvider();

// both phantom and solletAdapter include
wallet.on('connect');
wallet.publicKey.toBase58();
wallet.on('disconnect');
wallet.disconnect();
wallet.connect();
wallet.signTransaction(transaction);
wallet.signAllTransactions(transactionsAndSigners);
wallet.autoApprove();

// phantom only
wallet.isPhantom = true;
wallet.isConnected = true;
wallet.request();
solana.listeners('disconnect')

// check sign, signTransaction, signAllTransactions at sollet PopupPage.js

 */

import { CONST_DAPP_MESSAGE_TYPES } from '../../../../consts/consts';

function init() {
  window.sollet = {
    hello: 'world',

    postMessage: (message) => {
      const listener = (event) => {
        if (event.detail.id === message.id) {
          window.removeEventListener(
            CONST_DAPP_MESSAGE_TYPES.CONTENT_TO_INPAGE,
            listener,
          );
          window.postMessage(event.detail);
        }
      };
      window.addEventListener(
        CONST_DAPP_MESSAGE_TYPES.CONTENT_TO_INPAGE,
        listener,
      );

      window.dispatchEvent(
        new window.CustomEvent(
          // sollet_injected_script_message
          CONST_DAPP_MESSAGE_TYPES.INPAGE_TO_CONTENT,
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
