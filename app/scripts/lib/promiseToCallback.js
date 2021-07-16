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
        // append callStack to error message, so that we can check it at ui console
        err.message = `${err.message}\n\n${err.stack}`;
        // also, print the error object at bg console
        console.error(err);

        setImmediateShim(cb, err);
      },
    );
  };
}
