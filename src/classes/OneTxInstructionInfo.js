import { CONST_TX_TYPES } from '../consts/consts';

class OneTxInstructionInfo {
  constructor({
    type = CONST_TX_TYPES.Unknown,
    from,
    to,
    amount,
    creator,
    ...others
  }) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.creator = creator;
    Object.assign(this, others);
  }
}

OneTxInstructionInfo.createTransferIx = function (options) {
  return new OneTxInstructionInfo({
    ...options,
    type: CONST_TX_TYPES.Transfer,
  });
};
OneTxInstructionInfo.createTokenTransferIx = function (options) {
  return new OneTxInstructionInfo({
    ...options,
    type: CONST_TX_TYPES.TokenTransfer,
  });
};
OneTxInstructionInfo.createTokenAssociateAddIx = function (options) {
  return new OneTxInstructionInfo({
    ...options,
    type: CONST_TX_TYPES.TokenAssociateAdd,
  });
};

export default OneTxInstructionInfo;
