import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { Tabs, Icon } from '@onekeyhq/ui-components';
import { useLocation } from 'react-router-dom';
import utilsApp from '../../utils/utilsApp';
import {
  ROUTE_HOME,
  ROUTE_HOME_OLD,
  ROUTE_TX_HISTORY,
} from '../../routes/routeUrls';
import {
  OVERVIEW_ROUTE,
  SETTINGS_ROUTE,
  TRANSACTIONS_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import styles from './index.css';

const { TabList, TabItem, TabPanels, TabPanel } = Tabs;

function createTabContentRender(items) {
  const render = function (props) {
    const { fitted, reversed, tabIcon, tabBadge } = props;
    return (
      <>
        <TabList reversed={reversed} fitted={fitted} className="justify-center">
          {items.map((item) => (
            <TabItem
              key={item.icon}
              reversed={reversed}
              fitted={fitted}
              icon={null}
              className="min-w-[64px]"
            >
              <Icon name={item.icon} size={30} />
            </TabItem>
          ))}
        </TabList>
      </>
    );
  };
  return {
    render,
    items,
  };
}

const CONST_TABS_NAMES = {
  Home: 'Home',
  Transaction: 'Transaction',
  Settings: 'Settings',
};

const homeTabContentRender = createTabContentRender([
  {
    name: CONST_TABS_NAMES.Home,
    onClick: () =>
      global.onekeyHistory.push(
        utilsApp.isNewHome() ? ROUTE_HOME : ROUTE_HOME_OLD,
      ),
    icon: 'HomeSolid',
  },
  {
    name: CONST_TABS_NAMES.Transaction,
    onClick: () =>
      global.onekeyHistory.push(
        utilsApp.isNewHome() ? ROUTE_TX_HISTORY : TRANSACTIONS_ROUTE,
      ),
    icon: 'ClockSolid',
  },
  {
    name: CONST_TABS_NAMES.Settings,
    onClick: () => global.onekeyHistory.push(SETTINGS_ROUTE),
    icon: 'CogSolid',
  },
]);
const ExtAppTabBar = observer(function ({ children, name }) {
  let _name = name;
  const location = useLocation();
  const { pathname } = location;
  let index = 0;
  if (!_name) {
    if (
      pathname.startsWith(ROUTE_HOME_OLD) ||
      pathname.startsWith(OVERVIEW_ROUTE)
    ) {
      _name = CONST_TABS_NAMES.Home;
    }

    if (pathname.startsWith(TRANSACTIONS_ROUTE)) {
      _name = CONST_TABS_NAMES.Transaction;
    }

    if (pathname.startsWith(SETTINGS_ROUTE)) {
      _name = CONST_TABS_NAMES.Settings;
    }
  }
  index = homeTabContentRender.items.findIndex((item) => item.name === _name);

  return (
    <div className="bg-white" key={pathname}>
      <Tabs
        defaultIndex={index}
        onChange={(_index) => homeTabContentRender.items[_index]?.onClick()}
        fitted={false}
        reversed
      >
        {homeTabContentRender.render}
      </Tabs>
    </div>
  );
});

ExtAppTabBar.propTypes = {
  children: PropTypes.any,
};
ExtAppTabBar.names = CONST_TABS_NAMES;

export default ExtAppTabBar;
