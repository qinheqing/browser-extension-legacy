import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import { range, sampleSize } from 'lodash';
import AppPageLayout from '../../components/AppPageLayout';
import storeAccount from '../../store/storeAccount';
import walletFactory from '../../wallets/walletFactory';
import OneAccountInfo from '../../classes/OneAccountInfo';
import { CONST_ACCOUNT_TYPES } from '../../consts/consts';
import ReactJsonView from '../../components/ReactJsonView';
import ImportAccountsList from '../../components/ImportAccountsList';
import useI18n from '../../hooks/useI18n';

// const PageSample = observer(PageSamplePure);

function PageCreateAccount() {
  const t = useI18n();
  const _wallet = useMemo(() => {
    const chainInfo = storeAccount.chainInfoOfAccountsGroup;
    return walletFactory.createWallet({
      chainInfo,
      accountInfo: new OneAccountInfo({
        type: CONST_ACCOUNT_TYPES.Wallet,
      }),
    });
  }, []);

  const generateAccounts = useCallback(
    async ({ start, limit }) => {
      const addresses = await _wallet.getAddresses({
        indexes: range(start, start + limit),
      });
      console.log('Generate accounts by hdPath', addresses);
      return addresses;
    },
    [_wallet],
  );

  return (
    <Observer>
      {() => {
        return (
          <AppPageLayout title={t('createAccount')}>
            <ImportAccountsList
              wallet={_wallet}
              onLoadMore={generateAccounts}
            />
          </AppPageLayout>
        );
      }}
    </Observer>
  );
}

PageCreateAccount.propTypes = {
  // children: PropTypes.any,
};

export default PageCreateAccount;
