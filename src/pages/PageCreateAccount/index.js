import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import { range, sampleSize } from 'lodash';
import AppFrame from '../../components/AppFrame';
import storeAccount from '../../store/storeAccount';
import walletFactory from '../../wallets/walletFactory';
import OneAccountInfo from '../../classes/OneAccountInfo';
import { CONSTS_ACCOUNT_TYPES } from '../../consts/consts';
import ReactJsonView from '../../components/ReactJsonView';
import ImportAccountsList from '../../components/ImportAccountsList';

// const PageSample = observer(PageSamplePure);

function PageCreateAccount() {
  const wallet1 = useMemo(() => {
    const chainInfo = storeAccount.chainInfoOfAccountsGroup;
    return walletFactory.createWallet({
      chainInfo,
      accountInfo: new OneAccountInfo({
        type: CONSTS_ACCOUNT_TYPES.Wallet,
      }),
    });
  }, []);

  const generateAccounts = useCallback(async ({ start, limit }) => {
    const addresses = await wallet1.getAddressesHdWallet({
      indexes: range(start, start + limit),
    });
    console.log('Generate accounts by hdPath', addresses);
    return addresses;
  }, []);

  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <ImportAccountsList
              wallet={wallet1}
              onLoadMore={generateAccounts}
            />
          </AppFrame>
        );
      }}
    </Observer>
  );
}

PageCreateAccount.propTypes = {
  // children: PropTypes.any,
};

export default PageCreateAccount;
