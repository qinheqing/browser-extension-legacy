import React from 'react';
import { observer } from 'mobx-react-lite';
import { useSelector } from 'react-redux';
import extension from 'extensionizer';
import { useHistory } from 'react-router-dom';
import { Button } from '@onekeyhq/ui-components';
import { getOriginOfCurrentTab } from '../../../ui/app/selectors';
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../shared/constants/app';
import ConnectedStatusIndicator from '../../../ui/app/components/app/connected-status-indicator';
import {
  CONNECTED_ACCOUNTS_ROUTE,
  CONNECTED_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import utilsApp from '../../utils/utilsApp';
import useCurrentChainInfo from '../../hooks/useCurrentChainInfo';
import { ROUTE_APPROVE_SETTINGS } from '../../routes/routeUrls';
import { ExtAccountSelector } from '../ExtAccountSelector/ExtAccountSelector';
import { ExtChainSelector } from '../ExtChainSelector/ExtChainSelector';
import { ExtTestNetBadge } from '../ExtTestNetBadge';
import { ExtAppHeaderMoreDropdown } from './ExtAppHeaderMoreDropdown';

function ExtAppHeaderExtraInfoBar() {
  const history = useHistory();
  const origin = useSelector(getOriginOfCurrentTab);
  const chainInfo = useCurrentChainInfo();

  const showStatus =
    utilsApp.isOldHome() &&
    getEnvironmentType() === ENVIRONMENT_TYPE_POPUP &&
    origin &&
    origin !== extension.runtime.id;

  return (
    <div className="flex items-center justify-center pl-4 pr-3">
      <div className="text-xs text-gray-500">
        {chainInfo.name}
        {chainInfo.isTestNet && <ExtTestNetBadge className="ml-2" />}
      </div>
      <div className="flex-1" />
      {showStatus && (
        <ConnectedStatusIndicator
          onClick={() => history.push(CONNECTED_ACCOUNTS_ROUTE)}
        />
      )}
      <Button
        ring={false}
        circular
        type="plain"
        size="xs"
        leadingIcon="GlobeAltOutline"
        onClick={() => {
          if (utilsApp.isNewHome()) {
            history.push(ROUTE_APPROVE_SETTINGS);
          } else {
            history.push(CONNECTED_ROUTE);
          }
        }}
      />
    </div>
  );
}

function ExtAppHeader() {
  return (
    <div className="bg-white">
      <div className="flex items-center px-2 ">
        <ExtChainSelector />
        <div className="flex-1" />
        <ExtAccountSelector />
        <div className="flex-1" />
        {/* TODO z-index in MM */}
        <ExtAppHeaderMoreDropdown />
      </div>
      <ExtAppHeaderExtraInfoBar />
    </div>
  );
}

export default observer(ExtAppHeader);
