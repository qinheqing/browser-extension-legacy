const setImmediateShim =
  typeof setImmediate === 'function'
    ? setImmediate
    : (...args) => {
        args.splice(1, 0, 0);
        setTimeout(...args);
      };

function isFunction(value) {
  const type = Object.prototype.toString.call(value);

  return (
    type === '[object Function]' ||
    type === '[object GeneratorFunction]' ||
    type === '[object AsyncFunction]'
  );
}

export default function promiseToCallback(promise) {
  if (!isFunction(promise.then)) {
    throw new TypeError('Expected a promise');
  }

  return function (cb) {
    promise.then(
      function (data) {
        setImmediateShim(cb, null, data);
      },
      function (err) {
        // create plain error object, so that ui console can view the stack detail
        const errObj = {
          message: err.message,
          stack: err.stack,
        };

        setImmediateShim(cb, errObj);

        // print the error object at bg console
        // console.error(err);
        // throw out the error at bg, so that global error handler can handle it
        throw err;
      },
    );
  };
}
