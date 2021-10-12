import React from 'react';
import { observer } from 'mobx-react-lite';
import AppPageLayout from '../../components/AppPageLayout';
import ReactJsonView from '../../components/ReactJsonView';
import uiBackgroundProxy from '../../wallets/bg/uiBackgroundProxy';
import { BACKGROUND_PROXY_MODULE_NAMES } from '../../consts/consts';
import uiDappApproval from '../../wallets/dapp/uiDappApproval';
import storeWallet from '../../store/storeWallet';
import ApprovePageLayout from './ApprovePageLayout';
import ApproveConnection from './ApproveConnection';
import { ApproveTransactionCFX } from './ApproveTransaction';

function PageApprovePopupCFX({ query }) {
  /*
  chainId: "0x1"
  id: 1649593367
  jsonrpc: "2.0"
  location: "http://testnet.unibuild.art/browse/"
  method: "cfx_requestAccounts"
  origin: "http://testnet.unibuild.art"
  streamName: "onekey-provider-cfx"
  tabId: 233
 */
  const { method } = query.request;
  if (method === 'cfx_requestAccounts') {
    return (
      <ApproveConnection
        query={query}
        onConnect={async (address) => {
          await uiDappApproval.approveConnection(query, address);
          window.close();
        }}
      />
    );
  }

  if (method === 'cfx_sendTransaction') {
    return <ApproveTransactionCFX query={query} />;
  }

  return (
    <ApprovePageLayout query={query}>
      <div className="p-4">
        <h1 className="font-bold mb-4">
          {query.baseChain} approve method=[{method}] is not supported.
        </h1>
        <ReactJsonView collapsed={false} src={query} />
      </div>
    </ApprovePageLayout>
  );
}

export default observer(PageApprovePopupCFX);
