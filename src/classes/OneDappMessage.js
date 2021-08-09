class OneDappMessage {
  // https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L32
  constructor({ id, method, params, result, error, channel, data }) {
    this.id = id;
    this.method = method;
    this.params = params;
    this.result = result;
    this.error = error;
    this.channel = channel;
    this.data = data;
    this.__messageTime__ = new Date().toString();
    // need determine messageType here:
    //    https://github.com/project-serum/sol-wallet-adapter/blob/master/src/index.ts#L37
    this.__messageType__ = 'ONEKEY_EXT';
  }

  static connectedMessage({ id, params: { publicKey, autoApprove } }) {
    return new OneDappMessage({
      id,
      method: 'connected',
      params: { publicKey, autoApprove },
    });
  }

  static disconnectedMessage({ id, params }) {
    return new OneDappMessage({
      id,
      method: 'disconnected',
      params,
    });
  }

  static signedMessage({
    id,
    result: { signatures, signature, publicKey, ...others },
  }) {
    return new OneDappMessage({
      id,
      result: { signatures, signature, publicKey, ...others },
    });
  }

  static errorMessage({ id, error }) {
    return new OneDappMessage({
      id,
      error,
    });
  }

  static extensionRuntimeMessage({ channel, data }) {
    return new OneDappMessage({ channel, data });
  }
}

export default OneDappMessage;
