/**
 * Promise-based replacement for setTimeout / clearTimeout.
 */
const promiseFinally = (promise, fn) => {
  const success = (result) => {
    fn();
    return result;
  };

  const error = (e) => {
    fn();
    return Promise.reject(e);
  };
  return Promise.resolve(promise).then(success, error);
};

/**
 * Converts any value to Error.
 * @param {*} value
 * @returns {Error}
 */
const toError = (value) => {
  // eslint-disable-next-line no-param-reassign
  value = typeof value === 'function' ? value() : value;
  return typeof value === 'string' ? new Error(value) : value;
};

export default class AwaitTimeout {
  static set(delay, rejectReason) {
    return new AwaitTimeout().set(delay, rejectReason);
  }

  static wrap(promise, delay, rejectReason) {
    return new AwaitTimeout().wrap(promise, delay, rejectReason);
  }

  constructor() {
    this._id = null;
    this._delay = null;
  }

  get id() {
    return this._id;
  }

  get delay() {
    return this._delay;
  }

  set(delay, rejectReason = '') {
    return new Promise((resolve, reject) => {
      this.clear();
      const fn = rejectReason ? () => reject(toError(rejectReason)) : resolve;
      this._id = setTimeout(fn, delay);
      this._delay = delay;
    });
  }

  wrap(promise, delay, rejectReason = '') {
    const wrappedPromise = promiseFinally(promise, () => this.clear());
    const timer = this.set(delay, rejectReason);
    return Promise.race([wrappedPromise, timer]);
  }

  clear() {
    if (this._id) {
      clearTimeout(this._id);
    }
  }
}

// https://github.com/vitalets/await-timeout
