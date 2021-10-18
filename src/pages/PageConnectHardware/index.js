// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Observer, observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { range } from 'lodash';
import SelectHardware from '../../../ui/app/pages/create-account/connect-hardware/select-hardware';
import {
  CONST_CHAIN_KEYS,
  CONST_HARDWARE_MODELS,
  CONSTS_ACCOUNT_TYPES,
} from '../../consts/consts';
import storeChain from '../../store/storeChain';
import walletFactory from '../../wallets/walletFactory';
import connectMockSOL from '../../utils/connectMockSOL';
import storeAccount from '../../store/storeAccount';
import AppPageLayout from '../../components/AppPageLayout';
import { ROUTE_HOME, ROUTE_WALLET_SELECT } from '../../routes/routeUrls';
import ReactJsonView from '../../components/ReactJsonView';
import OneAccountInfo from '../../classes/OneAccountInfo';
import ImportAccountsList from '../../components/ImportAccountsList';
import NavBackButton from '../../components/NavBackButton';

export default observer(function PageConnectHardware() {
  const [browserSupported, setBrowserSupported] = useState(true);
  const [wallet, setWallet] = useState(null);

  const generateAccounts = useCallback(
    async ({ start, limit }) => {
      const { chainInfo } = wallet;
      const isSolWallet = chainInfo.baseChain === CONST_CHAIN_KEYS.SOL;

      const indexesRange = range(start, start + limit);

      let addrs = [];

      if (isSolWallet) {
        addrs = indexesRange.map((index) => ({
          address: index,
          path: wallet.hdkeyManager.createHdPath({ index }),
          hdPathIndex: index,
          chainKey: chainInfo.key,
          type: CONSTS_ACCOUNT_TYPES.Hardware,
        }));
      } else {
        addrs = await wallet.getAddresses({ indexes: indexesRange });
      }

      addrs = await Promise.all(
        addrs.map(async (addr) => {
          let { address } = addr;
          if (isSolWallet) {
            // mock SOL address as hardware not ready yet
            const account = await connectMockSOL.getAccountFromMnemonic({
              hdPath: addr.path,
            });
            address = account.publicKey.toString();
          }
          return {
            ...addr,
            address,
          };
        }),
      );

      return addrs;
    },
    [wallet],
  );

  const connectToHardwareWallet = async (
    device = CONST_HARDWARE_MODELS.OneKeyClassic,
  ) => {
    const chainInfo = storeAccount.chainInfoOfAccountsGroup;
    const accountInfo = new OneAccountInfo({
      type: CONSTS_ACCOUNT_TYPES.Hardware,
      hardwareModel: device,
    });
    const _wallet = walletFactory.createWallet({
      hardwareModel: device,
      chainInfo,
      accountInfo,
    });
    setWallet(_wallet);
  };

  if (!wallet) {
    return (
      <AppPageLayout>
        <SelectHardware
          connectToHardwareWallet={connectToHardwareWallet}
          browserSupported={browserSupported}
        />
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout>
      <ImportAccountsList wallet={wallet} onLoadMore={generateAccounts} />
    </AppPageLayout>
  );
});
