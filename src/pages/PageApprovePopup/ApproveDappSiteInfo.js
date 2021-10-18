import React from 'react';
import { observer } from 'mobx-react-lite';
import storeAccount from '../../store/storeAccount';
import useDataRequiredOrRedirect from '../../utils/hooks/useDataRequiredOrRedirect';
import AppIcons from '../../components/AppIcons';
import { ChainLogoIcon } from '../../components/LogoIcon';

function ApproveDappSiteInfo({ query, title, showAccountInfo = false }) {
  const account = storeAccount.currentAccountInfo;
  if (useDataRequiredOrRedirect(account)) {
    return null;
  }
  const connectAccountInfo = account && (
    <>
      <AppIcons.SwitchVerticalIcon className="w-10 my-4 text-green-one-500" />
      {account && (
        <>
          <div className="font-bold">{account.name}</div>
          <div className="text-center break-all text-sm text-gray-500 leading-none">
            <ChainLogoIcon size="sm" className="mr-2" />
            {storeAccount.currentAccountAddressShort}
          </div>
        </>
      )}
    </>
  );
  return (
    <div className="flex flex-col items-center py-6 px-4">
      <AppIcons.GlobeAltIcon className="w-12 text-gray-400" />
      <h1 className="text-2xl mt-2 mb-1">{title}</h1>
      <div className="text-sm text-gray-500">{query.origin}</div>
      {showAccountInfo && connectAccountInfo}
    </div>
  );
}

export default observer(ApproveDappSiteInfo);
