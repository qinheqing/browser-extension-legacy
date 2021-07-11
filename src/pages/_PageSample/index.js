import React from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AppPageLayout from '../../components/AppPageLayout';
import styles from './index.css';

function PageSample() {
  return <AppPageLayout title="OneKey">Hello PageSample</AppPageLayout>;
}

PageSample.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageSample);
