class OneTransactionInfo {
  constructor({
    instructions = [],
    recentBlockhash,
    creatorAddress,
    creatorHdPath,
  }) {
    this.instructions = instructions;
    // ETH: nonce (getTransactionCount)
    // SOL: recentBlockhash (nonceInfo.nonce)
    this.recentBlockhash = recentBlockhash;
    // TODO replace to accountInfo
    this.creatorAddress = creatorAddress;
    this.creatorHdPath = creatorHdPath;
  }
}

export default OneTransactionInfo;
