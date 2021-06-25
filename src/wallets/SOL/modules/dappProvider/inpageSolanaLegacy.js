import { EventEmitter } from 'events';
import pump from 'pump';
import LocalMessageDuplexStream from 'post-message-stream';
import { JsonRpcEngine } from 'json-rpc-engine';
import createJsonRpcStream from 'json-rpc-middleware-stream';
import debug from 'debug';
import ObjectMultiplex from 'obj-multiplex';
import { duplex as isDuplex } from 'is-stream';

// - https://docs.phantom.app/
// - https://github.com/solana-labs/browser-extension#usage

const createLogger = (module) => {
  return debug(module);
};
const createObjectMultiplex = (name) => {
  return new ObjectMultiplex(name);
  // return (new ObjectMultiplex())
};

const log = createLogger('sol:inPage');

// import {
//   CONTENT_MESSAGE_STREAM,
//   INPAGE_MESSAGE_STREAM,
//   MUX_PROVIDER_SUBSTREAM,
//   Notification,
//   WallActions,
// } from "../core/types"
const MUX_PROVIDER_SUBSTREAM = 'sol.provider';
const INPAGE_MESSAGE_STREAM = 'sol.inpage';
const CONTENT_MESSAGE_STREAM = 'sol.cs';

class Provider extends EventEmitter {
  _csStream = null;

  _rpcEngine = null;

  _nextRequestId = null; // number

  constructor(csStream) {
    super(); // TODO: secure that, do we want to expose all the methods therein?

    this._nextRequestId = 1;

    this._csStream = csStream;

    if (!isDuplex(csStream)) {
      throw new Error('Must provide a Node.js-style duplex stream.');
    }

    // setup connectionStream multiplexing
    const mux = createObjectMultiplex('inpage-cs-mux');
    pump(
      csStream,
      mux,
      csStream,
      this._handleDisconnect.bind(this, 'Solana content'),
    );

    const jsonRpcConnection = createJsonRpcStream();
    pump(
      jsonRpcConnection.stream,
      mux.createStream(MUX_PROVIDER_SUBSTREAM),
      jsonRpcConnection.stream,
      this._handleDisconnect.bind(this, 'Solana RpcProvider'),
    );

    // handle RPC requests via dapp-side rpc engine
    const rpcEngine = new JsonRpcEngine();
    // rpcEngine.push(createIdRemapMiddleware())
    // rpcEngine.push(createErrorMiddleware())
    rpcEngine.push(jsonRpcConnection.middleware);
    this._rpcEngine = rpcEngine;

    // json rpc notification listener

    /*
    resp: Notification
     */
    jsonRpcConnection.events.on('notification', (resp) => {
      log('Notification : %O', resp);
      log('Received notification [%s] : %O', resp.type, resp.data);
      this.emit(resp.type, resp.data);
    });
  }

  /*
  args:
    {
      method: WallActions
      params?: unknown[] | object
    }
   */
  request = (args) => {
    const requestId = this._nextRequestId;
    // eslint-disable-next-line no-plusplus
    ++this._nextRequestId;
    log('inpage requesting %s with params: %O', args.method, args.params);
    return new Promise((resolve, reject) => {
      let req = { id: requestId, jsonrpc: '2.0', method: args.method };
      if (args.params) {
        req = Object.assign(req, { params: args.params });
      }
      this._rpcEngine.handle(req, function (err, response) {
        if (err) {
          log('rpc engine [%s] failed: %O ', err);
          reject(err);
        } else {
          log('rpc engine [%s] responded: %O ', response);
          resolve(response);
        }
      });
    });
  };

  // Called when connection is lost to critical streams.
  _handleDisconnect = (streamName, err) => {
    log(
      'Solana Inpage Provider lost connection to %s: %s with stack %O',
      streamName,
      err,
      err.stack,
    );
    this.emit('disconnected');
  };
}

// setup background connection./app/background/background.ts
const csStream = new LocalMessageDuplexStream({
  name: INPAGE_MESSAGE_STREAM,
  target: CONTENT_MESSAGE_STREAM,
});

function initProvider() {
  log('initializing provider');
  const provider = new Provider(csStream);
  provider.isPhantom = true;
  // @ts-ignore
  window.solana = provider;
  log("dispatching window event 'solana#initialized'");
  window.dispatchEvent(new Event('solana#initialized'));
}

export default {
  init: initProvider,
};
