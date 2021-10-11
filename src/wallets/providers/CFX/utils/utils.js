import { Conflux, Contract, format } from 'js-conflux-sdk';
import { isString } from 'lodash';

// https://confluxnetwork.gitbook.io/js-conflux-sdk/api/utils#util-format.js-format-static-address
function formatToAddress(address, networkId, verbose = false) {
  /*
  format.address('0x0123456789012345678901234567890123456789', 1)
    "cfxtest:aaawgvnhveawgvnhveawgvnhveawgvnhvey1umfzwp"
   */
  return format.address(address, networkId, verbose);
}

// https://confluxnetwork.gitbook.io/js-conflux-sdk/api/utils#util-format.js-format-static-hexaddress
function formatToHexAddress(address) {
  /*
  format.hexAddress('0x0123456789012345678901234567890123456789')
    "0x0123456789012345678901234567890123456789"

  format.hexAddress('cfxtest:aaawgvnhveawgvnhveawgvnhveawgvnhvey1umfzwp')
      0x0123456789012345678901234567890123456789
   */
  return format.hexAddress(address);
}

// https://confluxnetwork.gitbook.io/js-conflux-sdk/api/utils#util-format.js-format-static-checksumaddress
function formatToChecksumAddress(address) {
  /*
  format.checksumAddress('0x1b716c51381e76900ebaa7999a488511a4e1fd0a')
    "0x1B716c51381e76900EBAA7999A488511A4E1fD0a"
 */
  return format.checksumAddress(address);
}

function isHexAddressLike(address) {
  // 0x8a5c9db7f480083373274e3d2bf41ff628a9f1e0
  return isString(address) && address.startsWith('0x') && address.length === 42;
}

export default {
  formatToAddress,
  formatToHexAddress,
  formatToChecksumAddress,
  isHexAddressLike,
};
