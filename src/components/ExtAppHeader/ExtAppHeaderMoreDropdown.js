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
  TRANSACTIONS_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import {
  ROUTE_ACCOUNT_DETAIL,
  ROUTE_APPROVE_SETTINGS,
  ROUTE_HOME,
  ROUTE_HOME_OLD,
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
import openStandalonePage from '../../utils/openStandalonePage';
import utilsApp from '../../utils/utilsApp';
import useCurrentAccountAvailable from '../../hooks/useCurrentAccountAvailable';
import storeAccount from '../../store/storeAccount';

function cleanSections(sections) {
  return sections.filter((item) => {
    if (item) {
      item.items = item?.items?.filter(Boolean) || [];
    }
    return Boolean(item) && item.items && item.items.length > 0;
  });
}

export function ExtAppHeaderMoreDropdown() {
  const t = useI18n();
  const history = useHistory();
  const accountAvailable = useCurrentAccountAvailable();
  const dispatch = useDispatch();
  const selectedIdentity = useSelector(getSelectedIdentity);
  const keyring = useSelector(getCurrentKeyring);
  const network = useSelector(deprecatedGetCurrentNetworkId);
  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  const { address } = selectedIdentity;
  const isRemovable = utilsApp.isOldHome() && keyring.type !== 'HD Key Tree';

  return (
    <Dropdown
      place="bottom-end"
      triggerProps={{ ring: false }}
      sections={cleanSections([
        // Expand View action
        {
          items: [
            utilsApp.isPopupEnvironment() && {
              content: t('expandView'),
              icon: 'ArrowsExpandOutline',
              onAction: () => {
                // global.platform.openExtensionInBrowser();
                openStandalonePage(
                  utilsApp.isNewHome() ? ROUTE_HOME : ROUTE_HOME_OLD,
                  '',
                );
              },
            },
          ],
        },
        // Account related actions
        accountAvailable && {
          items: [
            {
              content: t('accountDetails'),
              icon: 'UserCircleSolid',
              onAction: () => {
                if (utilsApp.isNewHome()) {
                  storeHistory.push(ROUTE_ACCOUNT_DETAIL);
                  return;
                }

                dispatch(showModal({ name: 'ACCOUNT_DETAILS' }));
              },
            },

            /*
            {
              content: t('activity'),
              icon: 'ClockSolid',
              onAction: () => {
                storeHistory.goToPageTxHistory();
              },
            },
            */

            {
              content: t('viewinExplorer'),
              icon: 'ExternalLinkSolid',
              onAction: () => {
                if (utilsApp.isNewHome()) {
                  storeHistory.openBlockBrowserLink({
                    account: storeAccount.currentAccountAddress,
                  });
                  return;
                }

                global.platform.openTab({
                  url: getAccountLink(address, chainId, rpcPrefs, network),
                });
              },
            },

            /*
              isRemovable && {
              content: t('removeAccount'),
              icon: 'TrashSolid',
              onAction: () => {
                dispatch(
                  showModal({
                    name: 'CONFIRM_REMOVE_ACCOUNT',
                    identity: selectedIdentity,
                  }),
                );
              },
            },
            */
          ],
        },
        // System related actions
        {
          items: [
            {
              content: t('lock'),
              icon: 'LockClosedSolid',
              onAction: storeApp.lockScreen,
            },

            /*
            {
              content: t('settings'),
              icon: 'CogSolid',
              // eslint-disable-next-line no-alert
              onAction: () => storeHistory.push(SETTINGS_ROUTE),
            },
            */
          ],
        },
      ])}
    />
  );
}
