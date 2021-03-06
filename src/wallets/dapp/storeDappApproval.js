/* eslint import/no-cycle: "error" */
import {
  observable,
  computed,
  autorun,
  untracked,
  action,
  makeObservable,
} from 'mobx';
import { uniqBy, isNil, cloneDeep } from 'lodash';
import BaseStoreWithStorage from '../../store/BaseStoreWithStorage';
import backgroundProxy from '../bg/backgroundProxy';
import utilsStorage from '../../utils/utilsStorage';
import utilsNumber from '../../utils/utilsNumber';
import walletFactory from '../walletFactory';
import { NOTIFICATION_NAMES } from '../../../app/scripts/controllers/permissions/enums';
import { STREAM_PROVIDER_CFX } from '../../../app/scripts/constants/consts';
import bgGetRootController from '../bg/bgGetRootController';
import { allBuiltInChains } from '../../config/chains/allBuiltInChains';
import utilsApp from '../../utils/utilsApp';

class StoreDappApproval extends BaseStoreWithStorage {
  // TODO ensure this store run in background,
  //      use class decorator instead of shouldRunInBackground
  constructor(props) {
    super(props);
    this.storageNamespace = utilsStorage.STORAGE_NAMESPACES.dappApproval;
    // auto detect fields decorators, and make them reactive
    makeObservable(this);

    this.autosave('connections');
  }

  // TODO deprecated
  async emitChainChangedOnLoaded() {
    await utilsApp.delay(1000);
    this.onChainChanged();
  }

  @observable.ref
  connections = {
    // [origin]: { origin, lastUpdate, accounts: [ { address, baseChain, chainKey, origin } ] }
  };

  // rename to getCurrentWallet
  async createWallet() {
    const chainInfo = await this.getCurrentChainInfo();
    const accountInfo = await this.getCurrentAccountRaw();
    const wallet = walletFactory.createWallet(
      {
        chainInfo,
        accountInfo,
      },
      {
        cache: true,
      },
    );
    return wallet;
  }

  async getUiStorageItem(field) {
    return await utilsStorage.getAutoSaveStorageItemAsync({
      field,
      namespace: utilsStorage.STORAGE_NAMESPACES.storage,
    });
  }

  async getCurrentAccountRaw() {
    return this.getUiStorageItem('currentAccountRaw');
  }

  /*
    {
	"accountNamePrefix": "",
	"addTokenMode": "CHAIN",
	"baseChain": "SOL",
	"browser": [
		{
			"account": "https://explorer.solana.com/address/{{account}}",
			"block": "https://explorer.solana.com/block/{{block}}",
			"home": "https://explorer.solana.com",
			"token": "https://explorer.solana.com/address/{{token}}",
			"tx": "https://explorer.solana.com/tx/{{tx}}"
		}
	],
	"chainLogo": "images/chains/solana.svg",
	"colorBg": "#8125f2",
	"currency": "SOL",
	"currencyLogo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
	"description": "",
	"fullName": "",
	"hdPathTemplate": "m/44'/501'/{{index}}'/0'",
	"isCustom": false,
	"isTestNet": false,
	"key": "SOL",
	"name": "Solana",
	"nativeToken": {
		"address": "",
		"chainId": 101,
		"decimals": 9,
		"logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
		"name": "Solana",
		"precision": 8,
		"symbol": "SOL",
		"tokenId": "solana"
	},
	"platformId": "solana",
	"rpc": [
		"https://api.mainnet-beta.solana.com"
	],
	"shortname": "Solana",
	"tokenChainId": 101
  }
   */
  async getCurrentChainInfo() {
    return this.getUiStorageItem('currentChainInfo');
  }

  getChainInfoFromBaseChain({ baseChain }) {
    return allBuiltInChains.find(
      (item) => item.baseChain === baseChain && !item.isTestNet,
    );
  }

  @action.bound
  async saveAccountsConnection({ baseChain, chainKey, origin, accounts }) {
    // eslint-disable-next-line no-param-reassign
    chainKey = ''; // chainKey not support in events, so disable it
    const currentAccounts = this._getApprovedAccountsFromOrigin(origin);
    const appendAccounts = accounts.map((address) => {
      return {
        address,
        baseChain,
        chainKey,
        origin,
      };
    });
    const newAccounts = uniqBy(
      [].concat(currentAccounts, appendAccounts),
      (item) => item.address + item.baseChain + (item.chainKey || ''),
    );
    this.connections = {
      ...this.connections,
      [origin]: {
        origin,
        lastUpdate: Date.now(),
        accounts: newAccounts,
      },
    };
  }

  @action.bound
  async removeAccountsConnection({ origin, account }) {
    const originInfo = this.connections[origin];
    if (originInfo && account) {
      originInfo.accounts = originInfo.accounts.filter(
        (acc) => acc.address !== account.address,
      );
    }

    if (!account || !originInfo.accounts.length) {
      delete this.connections[origin];
    }

    this.connections = { ...this.connections };
    await utilsApp.delay(500);
    this.onAccountsChanged();
  }

  async getChainMeta({ baseChain }) {
    let chainInfo = await this.getCurrentChainInfo();
    // ext should return same baseChain.chainId, otherwise some dapp will cause errors
    if (!chainInfo || baseChain !== chainInfo.baseChain) {
      chainInfo = this.getChainInfoFromBaseChain({ baseChain });
    }
    const { tokenChainId, key: chainKey } = chainInfo;
    // chainId: '0x1',
    // networkVersion: '1',
    // TODO NewHome not match, mock chainId and networkVersion
    //    MOCK_CHAIN_ID_WHEN_NEW_APP
    const chainId = utilsNumber.intToHex(tokenChainId);
    const networkVersion = `${tokenChainId}`;
    return {
      chainId,
      networkVersion,
      chainKey,
      baseChain,
    };
  }

  async requestAccounts({ request, baseChain, chainKey, origin }) {
    let accounts = await this.getAccounts({
      baseChain,
      chainKey,
      origin,
    });
    if (accounts?.length) {
      return accounts;
    }
    accounts = await this.openApprovalPopup(request);
    // TODO check baseChain and chainKey is matched with current chain
    await this.saveAccountsConnection({
      baseChain,
      chainKey,
      origin,
      accounts,
    });
    return accounts;
  }

  _getApprovedAccountsFromOrigin(origin) {
    return this.connections[origin]?.accounts || [];
  }

  async getAccounts({ baseChain, chainKey, origin }) {
    // eslint-disable-next-line no-param-reassign
    chainKey = ''; // chainKey not support in events, so disable it
    const isUnlocked = global.$ok_isUnlockedCheck();

    if (!isUnlocked) {
      return [];
    }

    if (utilsApp.isOldHome()) {
      return [];
    }
    const currentAccount = await this.getCurrentAccountRaw();
    if (!currentAccount) {
      return [];
    }
    // TODO baseChain not match
    // TODO NewHome not match ( current is EVM chain )
    const allAccounts = this._getApprovedAccountsFromOrigin(origin);
    return allAccounts
      .filter((acc) => {
        let found = acc.baseChain === baseChain;
        if (chainKey && acc.chainKey) {
          found = found && chainKey === acc.chainKey;
        }
        return found;
      })
      .filter((acc) => {
        return (
          acc.baseChain === currentAccount.baseChain &&
          acc.address === currentAccount.address
        );
      })
      .map((acc) => acc.address);
    // TODO update lastUpdate
  }

  async openApprovalPopup(request) {
    return new Promise((resolve, reject) => {
      const { origin, baseChain } = request;
      if (!baseChain) {
        throw new Error(
          'openApprovalPopup error: request.baseChain not defined',
        );
      }
      const key = backgroundProxy.dappApprovalMethods.saveApproval({
        baseChain,
        origin,
        resolve,
        reject,
      });
      global.$ok_openApprovalPopup({
        baseChain,
        request,
        key,
      });
    });
  }

  notifyAllConnections(getPayload) {
    // noop
    const bg = bgGetRootController({ unlockRequired: false });

    bg.notifyAllConnections(getPayload, STREAM_PROVIDER_CFX);
    // bg.notifyAllConnections(getPayload, STREAM_PROVIDER_SOL;
  }

  onUnlockedChanged({ isUnlocked } = {}) {
    const getPayload = async (origin, { baseChain }) => {
      let accounts = [];
      if (isUnlocked) {
        accounts = await this.getAccounts({ baseChain, origin });
      }
      return {
        method: NOTIFICATION_NAMES.unlockStateChanged,
        params: {
          isUnlocked,
          accounts, // accounts is required, otherwise the provider will treat it as []
        },
      };
    };
    this.notifyAllConnections(getPayload);
  }

  onAccountsChanged({ address, _memo } = {}) {
    const getPayload = async (origin, { baseChain }) => {
      const accounts = await this.getAccounts({ baseChain, origin });
      return {
        method: NOTIFICATION_NAMES.accountsChanged,
        params: accounts,
        _memo,
      };
    };
    this.notifyAllConnections(getPayload);
  }

  onChainChanged() {
    const getPayload = async (origin, { baseChain }) => {
      // { chainId,  networkVersion,  chainKey,  baseChain }
      const chainMeta = await this.getChainMeta({ baseChain, origin });
      return {
        method: NOTIFICATION_NAMES.chainChanged,
        params: chainMeta,
        _memo: 'StoreDappApproval.onChainChanged',
      };
    };
    this.notifyAllConnections(getPayload);
  }
}

global._storeDappApproval = new StoreDappApproval({
  shouldRunInBackground: true,
});
export default global._storeDappApproval;
