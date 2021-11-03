import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function ExtAppNavBar({ children }) {
  return <div>ExtAppNavBar</div>;
}

ExtAppNavBar.propTypes = {
  children: PropTypes.any,
};

export default observer(ExtAppNavBar);
