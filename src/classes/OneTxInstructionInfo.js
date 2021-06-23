import { CONST_TX_TYPES } from '../consts/consts';

class OneTxInstructionInfo {
  constructor({ type = CONST_TX_TYPES.Unknown, from, to, amount }) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.amount = amount;
  }
}

class TransferInstruction extends OneTxInstructionInfo {
  constructor(options) {
    super({
      ...options,
      type: CONST_TX_TYPES.Transfer,
    });
  }
}

OneTxInstructionInfo.Transfer = TransferInstruction;

export default OneTxInstructionInfo;
