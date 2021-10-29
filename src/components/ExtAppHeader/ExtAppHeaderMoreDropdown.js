import { Dropdown } from '@onekeyhq/ui-components';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import useI18n from '../../hooks/useI18n';
import storeApp from '../../store/storeApp';
import storeHistory from '../../store/storeHistory';
import {
  CONNECTED_ROUTE,
  SETTINGS_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import {
  ROUTE_APPROVE_SETTINGS,
  ROUTE_TX_HISTORY,
} from '../../routes/routeUrls';
import {
  deprecatedGetCurrentNetworkId,
  getCurrentChainId,
  getCurrentKeyring,
  getRpcPrefsForCurrentProvider,
  getSelectedIdentity,
} from '../../../ui/app/selectors';
import { showModal } from '../../../ui/app/store/actions';
import getAccountLink from '../../../ui/lib/account-link';

export function ExtAppHeaderMoreDropdown() {
  const t = useI18n();
  const history = useHistory();
  const dispatch = useDispatch();
  const selectedIdentity = useSelector(getSelectedIdentity);
  const keyring = useSelector(getCurrentKeyring);
  const network = useSelector(deprecatedGetCurrentNetworkId);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  const { address } = selectedIdentity;
  const isRemovable = keyring.type !== 'HD Key Tree';

  return (
    <Dropdown
      place="bottom-end"
      sections={[
        {
          items: [
            {
              content: t('accountDetails'),
              icon: 'CogSolid',
              onAction: () => {
                dispatch(showModal({ name: 'ACCOUNT_DETAILS' }));
              },
            },
            {
              content: t('viewinExplorer'),
              icon: 'CogSolid',
              onAction: () => {
                global.platform.openTab({
                  url: getAccountLink(address, chainId, rpcPrefs, network),
                });
              },
            },
            {
              content: t('connectedSites'),
              icon: 'CogSolid',
              onAction: () => {
                history.push(CONNECTED_ROUTE);
              },
            },
            {
              content: t('removeAccount'),
              icon: 'CogSolid',
              onAction: () => {
                dispatch(
                  showModal({
                    name: 'CONFIRM_REMOVE_ACCOUNT',
                    identity: selectedIdentity,
                  }),
                );
              },
            },
          ],
        },
        {
          items: [
            {
              content: t('lock'),
              icon: 'LockClosedSolid',
              onAction: storeApp.lockScreen,
            },
            {
              content: t('settings'),
              icon: 'CogSolid',
              // eslint-disable-next-line no-alert
              onAction: () => storeHistory.push(SETTINGS_ROUTE),
            },
            {
              content: '授权',
              icon: 'ShieldExclamationSolid',
              onAction: () => storeHistory.push(ROUTE_APPROVE_SETTINGS),
            },
          ],
        },
        {
          items: [
            {
              content: t('activity'),
              icon: 'ClockSolid',
              onAction: () => storeHistory.push(ROUTE_TX_HISTORY),
            },
          ],
        },
      ]}
    />
  );
}
