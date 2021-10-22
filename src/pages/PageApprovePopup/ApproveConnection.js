import { observer } from 'mobx-react-lite';
import React from 'react';
import storeAccount from '../../store/storeAccount';
import OneButton from '../../components/OneButton';
import { ChainLogoIcon } from '../../components/LogoIcon';
import ApprovePageLayout from './ApprovePageLayout';
import ApproveDappSiteInfo from './ApproveDappSiteInfo';

const ApproveConnection = observer(function ({ onConnect, query }) {
  const account = storeAccount.currentAccountInfo;
  return (
    <ApprovePageLayout
      navRight={<ChainLogoIcon />}
      query={query}
      title="连接账户"
      actions={
        <>
          {account && (
            <>
              <OneButton block type="white" onClick={() => window.close()}>
                取消
              </OneButton>
              <div className="w-4" />
              <OneButton
                block
                type="primary"
                onClick={() => onConnect(account.address)}
              >
                连接
              </OneButton>
            </>
          )}
        </>
      }
    >
      <div className="pt-8">
        <ApproveDappSiteInfo
          title="是否允许该网站连接"
          query={query}
          showAccountInfo
        />
      </div>
      {/* <ReactJsonView collapsed={false} src={query} />*/}
    </ApprovePageLayout>
  );
});

export default ApproveConnection;
