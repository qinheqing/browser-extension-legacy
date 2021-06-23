/**
 * Created by zuozhuo on 2021/6/17.
 */
'use strict';

function init() {
  window.onekey = {
    hello: 'world',

    postMessage: (message) => {
      const listener = (event) => {
        if (event.detail.id === message.id) {
          window.removeEventListener('sollet_contentscript_message', listener);
          window.postMessage(event.detail);
        }
      };
      window.addEventListener('sollet_contentscript_message', listener);

      window.dispatchEvent(
        new window.CustomEvent('sollet_injected_script_message', {
          detail: message,
        }),
      );
    },
  };
}

export default {
  init,
};
