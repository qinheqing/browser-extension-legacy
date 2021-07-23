import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import AppPageLayout from '../../components/AppPageLayout';
import storeAccount from '../../store/storeAccount';
import storeHistory from '../../store/storeHistory';
import storeStorage from '../../store/storeStorage';
import AppIcons from '../../components/AppIcons';
import CopyHandle from '../../components/CopyHandle';
import OneDialog from '../../components/OneDialog';
import EditableLabel from '../../components/EditableLabel';
import utilsToast from '../../utils/utilsToast';

function PageAccountDetail() {
  const [dialogVisible, setDialogVisible] = useState(false);

  const onDeleteAccount = useCallback(() => {
    storeAccount.deleteAccountByAddress(storeAccount.currentAccountAddress);
    storeHistory.goBack();
  }, []);

  return (
    <AppPageLayout
      title="账户详情"
      whiteBg={false}
      navRight={
        <AppIcons.LinkIcon
          role="button"
          className="w-6"
          onClick={() =>
            storeHistory.openBlockBrowserLink({
              account: storeAccount.currentAccountAddress,
            })
          }
        />
      }
    >
      <div>
        <div className="flex flex-col h-40 justify-center items-center">
          <img src="images/chains/solana.svg" className="w-10 h-10" />
          <EditableLabel
            className="pt-2"
            defaultValue={storeAccount.currentAccount.name}
            onSubmit={storeAccount.changeAccountName}
          />
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            <li className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <div>地址</div>
              <div>
                <CopyHandle text={storeAccount.currentAccountAddress}>
                  {storeAccount.currentAccountAddressShort}
                </CopyHandle>
              </div>
            </li>
            <li className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <div>路径</div>
              <div>{storeAccount.currentAccount.path}</div>
            </li>
            <li className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <div>类型</div>
              <div>{storeAccount.currentAccountTypeText}</div>
            </li>
          </ul>
        </div>
        {storeStorage.allAccountsRaw.length > 1 ? (
          <div className="mt-20 px-3">
            <button
              onClick={() => setDialogVisible(true)}
              type="button"
              className="w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-700"
            >
              删除账户
            </button>
          </div>
        ) : null}
      </div>
      <OneDialog
        title="删除账户"
        content="你确认要删除账户，删除后不能恢复"
        confirmText="删除"
        onConfirm={onDeleteAccount}
        open={dialogVisible}
        onOpenChange={(val) => setDialogVisible(val)}
      />
    </AppPageLayout>
  );
}

export default observer(PageAccountDetail);
