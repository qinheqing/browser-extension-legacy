import { ObservableStore } from '@onekeyhq/obs-store';
import log from 'loglevel';
import BN from 'bn.js';
import createId from '../lib/random-id';
import { bnToHex } from '../lib/util';
import getFetchWithTimeout from '../../../shared/modules/fetch-with-timeout';

import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_STATUSES,
} from '../../../shared/constants/transaction';
import {
  CHAIN_ID_TO_NETWORK_ID_MAP,
  CHAIN_ID_TO_TYPE_MAP,
  GOERLI,
  GOERLI_CHAIN_ID,
  KOVAN,
  KOVAN_CHAIN_ID,
  MAINNET,
  MAINNET_CHAIN_ID,
  RINKEBY,
  RINKEBY_CHAIN_ID,
  ROPSTEN,
  ROPSTEN_CHAIN_ID,
  TEST_CHAINS,
  HECO_CHAIN_ID,
  HECO,
  BSC_CHAIN_ID,
  BSC,
  MATIC_CHAIN_ID,
  MATIC,
  XDAI_CHAIN_ID,
  XDAI,
  AVAX_CHAIN_ID,
  AVAX,
} from '../../../shared/constants/network';
import { removeUrlLastSlash } from '../../../shared/modules/network.utils';
import { NETWORK_EVENTS } from './network';

const fetchWithTimeout = getFetchWithTimeout(30000);

/**
 * This controller is responsible for retrieving incoming transactions. Etherscan is polled once every block to check
 * for new incoming transactions for the current selected account on the current network
 *
 * Note that only the built-in Infura networks are supported (i.e. anything in `INFURA_PROVIDER_TYPES`). We will not
 * attempt to retrieve incoming transactions on any custom RPC endpoints.
 */
const etherscanSupportedNetworks = [
  // AVAX_CHAIN_ID,
  MAINNET_CHAIN_ID,
  GOERLI_CHAIN_ID,
  KOVAN_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  ROPSTEN_CHAIN_ID,
  BSC_CHAIN_ID,
  HECO_CHAIN_ID,
  MATIC_CHAIN_ID,
  XDAI_CHAIN_ID,
];

export default class IncomingTransactionsController {
  constructor(opts = {}) {
    const { blockTracker, networkController, preferencesController } = opts;
    this.blockTracker = blockTracker;
    this.networkController = networkController;
    this.preferencesController = preferencesController;

    this.lastChainId = null;
    this._onLatestBlock = async (newBlockNumberHex) => {
      const selectedAddress = this.preferencesController.getSelectedAddress();
      const newBlockNumberDec = parseInt(newBlockNumberHex, 16);
      await this._update({
        address: selectedAddress,
        newBlockNumberDec,
      });
    };

    const initState = {
      incomingTransactions: {},
      incomingTxLastFetchedBlocksByNetwork: {
        [AVAX]: null,
        [GOERLI]: null,
        [KOVAN]: null,
        [MAINNET]: null,
        [RINKEBY]: null,
        [ROPSTEN]: null,
        [BSC]: null,
        [HECO]: null,
        [MATIC]: null,
        [XDAI]: null,
      },
      ...opts.initState,
    };
    this.store = new ObservableStore(initState);

    this.preferencesController.store.subscribe(
      pairwise((prevState, currState) => {
        const {
          featureFlags: {
            showIncomingTransactions: prevShowIncomingTransactions,
          } = {},
        } = prevState;
        const {
          featureFlags: {
            showIncomingTransactions: currShowIncomingTransactions,
          } = {},
        } = currState;

        if (currShowIncomingTransactions === prevShowIncomingTransactions) {
          return;
        }

        if (prevShowIncomingTransactions && !currShowIncomingTransactions) {
          this.stop();
          return;
        }

        this.start();
      }),
    );

    this.preferencesController.store.subscribe(
      pairwise(async (prevState, currState) => {
        const { selectedAddress: prevSelectedAddress } = prevState;
        const { selectedAddress: currSelectedAddress } = currState;

        if (currSelectedAddress === prevSelectedAddress) {
          return;
        }

        await this._update({
          address: currSelectedAddress,
        });
      }),
    );

    this.networkController.on(NETWORK_EVENTS.NETWORK_DID_CHANGE, async () => {
      const address = this.preferencesController.getSelectedAddress();
      await this._update({
        address,
      });
    });
  }

  start() {
    const { featureFlags = {} } = this.preferencesController.store.getState();
    const { showIncomingTransactions } = featureFlags;

    if (!showIncomingTransactions) {
      return;
    }

    this.lastChainId = null;
    this.blockTracker.removeListener('latest', this._onLatestBlock);
    this.blockTracker.addListener('latest', this._onLatestBlock);
  }

  stop() {
    this.blockTracker.removeListener('latest', this._onLatestBlock);
  }

  async _update({ address, newBlockNumberDec } = {}) {
    const chainId = this.networkController.getCurrentChainId();
    if (!etherscanSupportedNetworks.includes(chainId)) {
      return;
    }

    try {
      const dataForUpdate = await this._getDataForUpdate({
        address,
        chainId,
        newBlockNumberDec,
      });
      this._updateStateWithNewTxData(dataForUpdate);
    } catch (err) {
      log.error(err);
    }
  }

  async _getDataForUpdate({ address, chainId, newBlockNumberDec } = {}) {
    const {
      incomingTransactions: currentIncomingTxs,
      incomingTxLastFetchedBlocksByNetwork: currentBlocksByNetwork,
    } = this.store.getState();

    const lastFetchBlockByCurrentNetwork =
      currentBlocksByNetwork[CHAIN_ID_TO_TYPE_MAP[chainId]];
    let blockToFetchFrom = lastFetchBlockByCurrentNetwork || newBlockNumberDec;
    if (blockToFetchFrom === undefined) {
      blockToFetchFrom = parseInt(this.blockTracker.getCurrentBlock(), 16);
    }

    // DO not set current block here, so that scan api can get all txs first time of chain changed
    if (this.lastChainId !== chainId) {
      blockToFetchFrom = undefined;
    }
    this.lastChainId = chainId;

    const { latestIncomingTxBlockNumber, txs: newTxs } = await this._fetchAll(
      address,
      blockToFetchFrom,
      chainId,
    );

    return {
      latestIncomingTxBlockNumber,
      newTxs,
      currentIncomingTxs,
      currentBlocksByNetwork,
      fetchedBlockNumber: blockToFetchFrom,
      chainId,
    };
  }

  _updateStateWithNewTxData({
    latestIncomingTxBlockNumber,
    newTxs,
    currentIncomingTxs,
    currentBlocksByNetwork,
    fetchedBlockNumber,
    chainId,
  }) {
    const newLatestBlockHashByNetwork = latestIncomingTxBlockNumber
      ? parseInt(latestIncomingTxBlockNumber, 10) + 1
      : fetchedBlockNumber + 1;
    const newIncomingTransactions = {
      ...currentIncomingTxs,
    };
    newTxs.forEach((tx) => {
      newIncomingTransactions[tx.hash] = tx;
    });

    this.store.updateState({
      incomingTxLastFetchedBlocksByNetwork: {
        ...currentBlocksByNetwork,
        [CHAIN_ID_TO_TYPE_MAP[chainId]]: newLatestBlockHashByNetwork,
      },
      incomingTransactions: newIncomingTransactions,
    });
  }

  async _fetchAll(address, fromBlock, chainId) {
    const fetchedTxResponse = await this._fetchTxs(address, fromBlock, chainId);
    return this._processTxFetchResponse(fetchedTxResponse);
  }

  getBlockApiUrl(chainId) {
    if (chainId === MAINNET_CHAIN_ID) {
      return removeUrlLastSlash('https://api.etherscan.io');
    } else if (chainId === HECO_CHAIN_ID) {
      return removeUrlLastSlash('https://api.hecoinfo.com');
    } else if (chainId === BSC_CHAIN_ID) {
      return removeUrlLastSlash('https://api.bscscan.com');
    } else if (chainId === MATIC_CHAIN_ID) {
      return removeUrlLastSlash('https://api.polygonscan.com');
    } else if (chainId === XDAI_CHAIN_ID) {
      return removeUrlLastSlash('https://blockscout.com/xdai/mainnet/api');
    }
    const etherscanSubdomain = `api-${CHAIN_ID_TO_TYPE_MAP[chainId]}`;
    return removeUrlLastSlash(`https://${etherscanSubdomain}.etherscan.io`);
  }

  async _fetchTxs(address, fromBlock, chainId) {
    const apiUrl = this.getBlockApiUrl(chainId);
    let url = `${apiUrl}/api?_=incomingTxTracker&module=account&action=txlist&address=${address}&tag=latest&page=1`;

    if (fromBlock) {
      url += `&startBlock=${parseInt(fromBlock, 10)}`;
    }
    // https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=0x67e49a99843325b4a7ed43effb1da911540c86a6&tag=latest&page=1&startBlock=9572101

    const response = await fetchWithTimeout(url);
    const parsedResponse = await response.json();

    return {
      ...parsedResponse,
      address,
      chainId,
    };
  }

  _processTxFetchResponse({ status, result = [], address, chainId }) {
    if (status === '1' && Array.isArray(result) && result.length > 0) {
      const remoteTxList = {};
      const remoteTxs = [];
      result.forEach((tx) => {
        if (!remoteTxList[tx.hash]) {
          remoteTxs.push(this._normalizeTxFromEtherscan(tx, chainId));
          remoteTxList[tx.hash] = 1;
        }
      });

      const incomingTxs = remoteTxs.filter(
        (tx) => tx.txParams?.to?.toLowerCase() === address.toLowerCase(),
      );
      incomingTxs.sort((a, b) => (a.time < b.time ? -1 : 1));

      let latestIncomingTxBlockNumber = null;
      incomingTxs.forEach((tx) => {
        if (
          tx.blockNumber &&
          (!latestIncomingTxBlockNumber ||
            parseInt(latestIncomingTxBlockNumber, 10) <
              parseInt(tx.blockNumber, 10))
        ) {
          latestIncomingTxBlockNumber = tx.blockNumber;
        }
      });
      return {
        latestIncomingTxBlockNumber,
        txs: incomingTxs,
      };
    }
    return {
      latestIncomingTxBlockNumber: null,
      txs: [],
    };
  }

  _normalizeTxFromEtherscan(txMeta, chainId) {
    const time = parseInt(txMeta.timeStamp, 10) * 1000;
    const status =
      txMeta.isError === '0'
        ? TRANSACTION_STATUSES.CONFIRMED
        : TRANSACTION_STATUSES.FAILED;
    return {
      blockNumber: txMeta.blockNumber,
      id: createId(),
      metamaskNetworkId: CHAIN_ID_TO_NETWORK_ID_MAP[chainId],
      chainId,
      status,
      time,
      txParams: {
        from: txMeta.from,
        gas: bnToHex(new BN(txMeta.gas)),
        gasPrice: bnToHex(new BN(txMeta.gasPrice)),
        nonce: bnToHex(new BN(txMeta.nonce)),
        to: txMeta.to,
        value: bnToHex(new BN(txMeta.value)),
      },
      hash: txMeta.hash,
      transactionCategory: TRANSACTION_CATEGORIES.INCOMING,
    };
  }
}

function pairwise(fn) {
  let first = true;
  let cache;
  return (value) => {
    try {
      if (first) {
        first = false;
        return fn(value, value);
      }
      return fn(cache, value);
    } finally {
      cache = value;
    }
  };
}
