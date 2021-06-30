import utilsToast from './utilsToast';

function init() {
  window.addEventListener('unhandledrejection', function (event) {
    // console.error(
    //   'Unhandled rejection (promise: ',
    //   event.promise,
    //   ', reason: ',
    //   event.reason,
    //   ').',
    // );
    utilsToast.toastError(event.reason);
  });

  console.log('window.addEventListener#error');
  window.addEventListener('error', (event) => {
    // TODO same error will dispatch twice
    console.log('window.addEventListener on error');
    utilsToast.toastError(event.error);
  });
}

export default {
  init,
};
