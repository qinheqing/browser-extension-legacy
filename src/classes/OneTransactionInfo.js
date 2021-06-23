class OneTransactionInfo {
  constructor({ instructions = [], lastHash, creator, creatorHdPath }) {
    this.instructions = instructions;
    // ETH: nonce (getTransactionCount)
    // SOL: recentBlockhash (nonceInfo.nonce)
    // TODO remove
    this.lastHash = lastHash;
    // TODO replace to accountInfo
    this.creator = creator;
    this.creatorHdPath = creatorHdPath;
  }
}

export default OneTransactionInfo;
