// @ts-nocheck
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
    hdPathIndex,
    balance = 0,
    decimals,
    currency,
    hardwareModel,
    ...others
  }) {
    Object.assign(this, others);
    this._raw = _raw;
    this.chainKey = chainKey;
    this.type = type; // accountType
    this.name = name;
    this.address = address;
    this.path = path;
    this.hdPathIndex = hdPathIndex;
    this.balance = balance;
    this.decimals = decimals;
    this.currency = currency;
    this.hardwareModel = hardwareModel;
    // TODO  uniqKey:  this.key = key || this.generateKey();
  }

  _raw = {};

  chainKey = '';

  chainInfo = null;

  type = CONSTS_ACCOUNT_TYPES.Hardware;

  name = ''; // HD-BSC-1

  address = '';

  path = ''; // m/44'/60'/0'/0/0

  balance = ''; // 0.88372

  decimals = 9;

  currency = ''; // BNB

  _abced = '9833';

  // TODO some secret fields
  // privateKey = '';
  // recoveryPhrase = '';
  // keyStore = ''
}

export default OneAccountInfo;
