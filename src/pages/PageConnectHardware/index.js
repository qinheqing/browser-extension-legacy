import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { range } from 'lodash';
import SelectHardware from '../../../ui/app/pages/create-account/connect-hardware/select-hardware';
import { DEFAULT_ROUTE } from '../../../ui/app/helpers/constants/routes';
import {
  CONST_CHAIN_KEYS,
  CONST_HARDWARE_MODELS,
  CONSTS_ACCOUNT_TYPES,
} from '../../consts/consts';
import storeChain from '../../store/storeChain';
import walletFactory from '../../wallets/walletFactory';
import connectMockSOL from '../../utils/connectMockSOL';
import storeAccount from '../../store/storeAccount';
import AppFrame from '../../components/AppFrame';
import { ROUTE_HOME, ROUTE_WALLET_SELECT } from '../../routes/routeUrls';

function OneAmount({ value, decimals = 0, precision = 8, round }) {
  const value1 = value || '0';
  const num = new BigNumber(value1).div(new BigNumber(10).pow(decimals));
  return num.toFixed(precision);
}

// eslint-disable-next-line react/prop-types
function AddressInfoItem({ address, hdPath, wallet, index, currency, name }) {
  const [accountInfo, setAccountInfo] = useState({});
  useEffect(() => {
    (async () => {
      // eslint-disable-next-line react/prop-types
      const info = await wallet.chainProvider.getAccountInfo({ address });
      setAccountInfo(info);
    })();
  }, [address]);
  // TODO custom name edit for each account
  return (
    <div>
      {name} @ {address}: @{' '}
      <OneAmount value={accountInfo.balance} decimals={accountInfo.decimals} />{' '}
      {currency} @ {hdPath}
    </div>
  );
}

export default function PageConnectHardware() {
  const history = useHistory();
  // TODO update this value
  const [browserSupported, setBrowserSupported] = useState(true);
  const [importedAddresses, setImportedAddresses] = useState([]);
  const [wallet, setWallet] = useState(null);
  const chainInfo = storeChain.getChainInfoByKey(
    storeAccount.accountsGroupFilter.chainKey,
  );

  useEffect(() => {
    if (!chainInfo) {
      console.log('chainInfo not found, can not connect hardware');
      history.replace(ROUTE_WALLET_SELECT);
    }
  }, [chainInfo]);

  const connectToHardwareWallet = async (
    device = CONST_HARDWARE_MODELS.OneKeyClassic,
  ) => {
    const wallet1 = walletFactory.createWallet({
      hardwareModel: device,
      chainInfo,
    });
    setWallet(wallet1);
    let addrs = await wallet1.getAddresses({ indexes: range(0, 10) });
    const chainAccounts = storeAccount.getAccountsByChainKey(chainInfo.key);
    let accountIndex = chainAccounts.length;
    addrs = await Promise.all(
      addrs.map(async (addr) => {
        let { address } = addr;
        if (wallet1.hdCoin === CONST_CHAIN_KEYS.SOL) {
          // mock SOL address as hardware not ready yet
          const account = await connectMockSOL.getAccountFromMnemonic({
            hdPath: addr.hdPath,
          });
          address = account.publicKey.toString();
        }
        accountIndex += 1;
        return {
          ...addr,
          address,
          decimals: wallet1.options.balanceDecimals,
          name: chainInfo.generateAccountName({ index: accountIndex }),
        };
      }),
    );
    console.log('connectToHardwareWallet', device);
    console.log(addrs);
    setImportedAddresses(addrs);
  };

  const confirmImport = () => {
    storeAccount.addAccounts(
      importedAddresses.map((addr) => {
        const { address, hdPath, name } = addr;
        return {
          name,
          chainKey: chainInfo.key,
          address,
          path: hdPath,
          type: CONSTS_ACCOUNT_TYPES.Hardware,
        };
      }),
    );
    history.replace(ROUTE_WALLET_SELECT);
  };

  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <div className="PageConnectHardware">
              <h1>
                Connect Hardware
                <button onClick={() => history.push(DEFAULT_ROUTE)}>
                  [Old Home]
                </button>
                <button onClick={() => history.push(ROUTE_HOME)}>
                  [New Home]
                </button>
                <pre className="u-nowrap">
                  chainInfo: {JSON.stringify(chainInfo, null, 4)}
                </pre>
              </h1>

              {importedAddresses && importedAddresses.length && (
                <div style={{ background: '#eee' }}>
                  <h1>Addresses</h1>
                  {importedAddresses.map((addr, index) => {
                    return (
                      <AddressInfoItem
                        key={addr.address}
                        currency={chainInfo.currency}
                        index={index}
                        wallet={wallet}
                        {...addr}
                      />
                    );
                  })}
                  <button onClick={confirmImport}>Confirm import</button>
                </div>
              )}

              <pre className="u-nowrap">
                importedAddresses: {JSON.stringify(importedAddresses, null, 4)}
              </pre>

              {!importedAddresses?.length && (
                <SelectHardware
                  connectToHardwareWallet={connectToHardwareWallet}
                  browserSupported={browserSupported}
                />
              )}
            </div>
          </AppFrame>
        );
      }}
    </Observer>
  );
}
