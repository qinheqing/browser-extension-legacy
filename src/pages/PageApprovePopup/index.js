import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import { useParams, useLocation } from 'react-router-dom';
import { ethErrors } from 'eth-rpc-errors';
import {
  BACKGROUND_PROXY_MODULE_NAMES,
  CONST_CHAIN_KEYS,
  CONST_DAPP_MESSAGE_TYPES,
  CONST_SOL,
} from '../../consts/consts';
import OneButton from '../../components/OneButton';
import utilsApp from '../../utils/utilsApp';
import storeChain from '../../store/storeChain';
import uiBackgroundProxy from '../../wallets/bg/uiBackgroundProxy';
import utilsUrl from '../../utils/utilsUrl';
import uiDappApproval from '../../wallets/dapp/uiDappApproval';
import PageApprovePopupSOL from './PageApprovePopupSOL';
import PageApprovePopupCFX from './PageApprovePopupCFX';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function useApproveQuery() {
  const { chain } = useParams();
  const { pathname, search } = useLocation();
  return useMemo(() => {
    const baseChain = chain.toUpperCase();
    const urlQuery = utilsUrl.getQuery({
      url: pathname + search,
    });
    // eslint-disable-next-line prefer-const
    let { key: approveKey, request } = urlQuery;

    /*
    chainId: "0x1"
    id: 1649593367
    jsonrpc: "2.0"
    location: "http://xxxx/abc/"
    method: "cfx_requestAccounts"
    origin: "http://xxxx"
    streamName: "onekey-provider-cfx"
    tabId: 233
     */
    request = JSON.parse(request);
    return {
      baseChain,
      approveKey,
      request,
      origin: request.origin,
    };
  }, [chain, pathname, search]);
}

function useBeforeUnload(query) {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const error = ethErrors.provider.userRejectedRequest();
      await uiDappApproval.reject(query, error);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [query]);
}

function PageApprovePopupEnsureChain() {
  const chainInfo = storeChain?.currentChainInfo;
  const query = useApproveQuery();
  useBeforeUnload(query);

  if (chainInfo?.baseChain !== query.baseChain || !utilsApp.isNewHome()) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="text-center py-16">
          请先切换到 {query.baseChain} 网络
        </div>
        <OneButton
          onClick={async () => {
            window.close();
          }}
        >
          关闭弹窗
        </OneButton>
      </div>
    );
  }

  if (query.baseChain === CONST_CHAIN_KEYS.SOL) {
    return <PageApprovePopupSOL />;
  }

  if (query.baseChain === CONST_CHAIN_KEYS.CFX) {
    return <PageApprovePopupCFX query={query} />;
  }
  return <div>chain={query.baseChain} not found</div>;
}

export default observer(PageApprovePopupEnsureChain);
