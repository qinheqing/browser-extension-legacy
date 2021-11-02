import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function ExtAppTabBar({ children }) {
  return <div>ExtAppTabBar</div>;
}

ExtAppTabBar.propTypes = {
  children: PropTypes.any,
};

export default observer(ExtAppTabBar);
