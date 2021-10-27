import {
  CONST_DAPP_RESPONSE_TYPES_SOL,
  CONST_DAPP_METHODS_SOL,
} from './consts';

class DappMessageSOL {
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

  // Message from Ext -> Dapp
  static connectedMessage({ id, params: { publicKey, autoApprove } }) {
    return new DappMessageSOL({
      id,
      // https://github.com/project-serum/sol-wallet-adapter/blob/be3fb1414425dc8ae64d67599d677f9acc09fe4c/src/index.ts#L53
      method: CONST_DAPP_RESPONSE_TYPES_SOL.connected,
      params: { publicKey, autoApprove },
    });
  }

  // Message from Ext -> Dapp
  static disconnectedMessage({ id, params }) {
    return new DappMessageSOL({
      id,
      // https://github.com/project-serum/sol-wallet-adapter/blob/be3fb1414425dc8ae64d67599d677f9acc09fe4c/src/index.ts#L63
      method: CONST_DAPP_RESPONSE_TYPES_SOL.disconnected,
      params,
    });
  }

  // Message from Ext -> Dapp
  static signedMessage({
    id,
    result: { signatures, signature, publicKey, ...others },
  }) {
    return new DappMessageSOL({
      id,
      // https://github.com/project-serum/sol-wallet-adapter/blob/be3fb1414425dc8ae64d67599d677f9acc09fe4c/src/index.ts#L65
      result: { signatures, signature, publicKey, ...others },
    });
  }

  // Message from Ext -> Dapp
  static errorMessage({ id, error }) {
    return new DappMessageSOL({
      id,
      // https://github.com/project-serum/sol-wallet-adapter/blob/be3fb1414425dc8ae64d67599d677f9acc09fe4c/src/index.ts#L65
      error,
    });
  }

  // Message between background, contentscript, popup ui
  //    extension.runtime.onMessage.addListener( message =>... )
  //    extension.runtime.sendMessage( message )
  static extensionRuntimeMessage({ channel, data }) {
    return new DappMessageSOL({ channel, data });
  }
}

export default DappMessageSOL;
