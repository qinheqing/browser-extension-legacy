import assert from 'assert';
import { throttle } from 'lodash';
import { getBackgroundInstanceAsync } from '../../../ui/app/store/actions';

function bgConnectionCheck(bg) {
  let isConnected = false;
  const timer = setTimeout(() => {
    assert(
      isConnected,
      // sometimes when you refresh background.html page
      'Extension background connection lost, please restart your extension or browser.',
    );
  }, 5000);
  bg.pingPong().then((res) => {
    if (res === 'pong') {
      isConnected = true;
      clearTimeout(timer);
    }
  });
}
const bgConnectionCheckThrottle = throttle(bgConnectionCheck, 3000, {
  leading: true,
  trailing: false,
});

async function uiGetBgControllerAsync() {
  const bg = await getBackgroundInstanceAsync();
  bgConnectionCheckThrottle(bg);
  return bg;
}

export default uiGetBgControllerAsync;
