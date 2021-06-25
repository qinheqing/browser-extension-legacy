import { CONSTS_ACCOUNT_TYPES } from '../consts/consts';

// TODO rename folder to models

class OneAccountInfo {
  constructor({
    _raw,
    chainKey,
    type,
    name,
    address,
    path,
    balance = 0,
    decimals,
    currency,
  }) {
    this._raw = _raw;
    this.chainKey = chainKey;
    this.type = type; // accountType
    this.name = name;
    this.address = address;
    this.path = path;
    this.balance = balance;
    this.decimals = decimals;
    this.currency = currency;
    // TODO  uniqKey:  this.key = key || this.generateKey();
  }

  _raw = {};

  chainKey = '';

  chainInfo = null; // chainProvider

  type = CONSTS_ACCOUNT_TYPES.Hardware;

  name = ''; // HD-BSC-1

  address = '';

  path = ''; // m/44'/60'/0'/0/0

  balance = ''; // 0.88372

  decimals = 9;

  currency = ''; // BNB

  // TODO some secret fields
  // privateKey = '';
  // recoveryPhrase = '';
  // keyStore = ''
}

export default OneAccountInfo;
