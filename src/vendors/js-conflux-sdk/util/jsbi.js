/**
 * support interface of [jsbi](https://github.com/GoogleChromeLabs/jsbi#readme)
 * - for node.js using native BigInt as JSBI.BigInt
 * - for browser using browserify to replace with jsbi
 */

// lockdown-run.js
// Uncaught TypeError: Cannot add property BigInt, object is not extensible

/* eslint-disable no-bitwise */
let bigIntObject = {};
bigIntObject = BigInt;
bigIntObject.BigInt = BigInt;

bigIntObject.toNumber = (x) => Number(x);

bigIntObject.unaryMinus = (x) => -x;
bigIntObject.bitwiseNot = (x) => ~x;

bigIntObject.exponentiate = (x, y) => x ** y;
bigIntObject.multiply = (x, y) => x * y;
bigIntObject.divide = (x, y) => x / y;
bigIntObject.remainder = (x, y) => x % y;
bigIntObject.add = (x, y) => x + y;
bigIntObject.subtract = (x, y) => x - y;
bigIntObject.leftShift = (x, y) => x << y;
bigIntObject.signedRightShift = (x, y) => x >> y;

bigIntObject.lessThan = (x, y) => x < y;
bigIntObject.lessThanOrEqual = (x, y) => x <= y;
bigIntObject.greaterThan = (x, y) => x > y;
bigIntObject.greaterThanOrEqual = (x, y) => x >= y;
bigIntObject.equal = (x, y) => x === y;
bigIntObject.notEqual = (x, y) => x !== y;

bigIntObject.bitwiseAnd = (x, y) => x & y;
bigIntObject.bitwiseXor = (x, y) => x ^ y;
bigIntObject.bitwiseOr = (x, y) => x | y;

bigIntObject.ADD = (x, y) => x + y;
bigIntObject.LT = (x, y) => x < y;
bigIntObject.LE = (x, y) => x <= y;
bigIntObject.GT = (x, y) => x > y;
bigIntObject.GE = (x, y) => x >= y;
bigIntObject.EQ = (x, y) => x === y;
bigIntObject.NE = (x, y) => x !== y;

module.exports = bigIntObject;
