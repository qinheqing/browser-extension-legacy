import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import styles from './index.css';

function ComponentSample({ children }) {
  return <div> ComponentSample: {children}</div>;
}

ComponentSample.propTypes = {
  children: PropTypes.any,
};

export default observer(ComponentSample);
