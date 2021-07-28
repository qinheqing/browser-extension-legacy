import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import AppIcons from '../AppIcons';
import styles from './index.css';

function OneArrow({
  classNameDefault = 'w-4 text-gray-300',
  className,
  type = 'chevron', // chevron, arrow
  direction = 'right', // right, left
  ...others
}) {
  let Cmp = AppIcons.ChevronRightIcon;
  if (direction === 'left') {
    Cmp = AppIcons.ChevronLeftIcon;
  }
  if (type === 'arrow') {
    Cmp = AppIcons.ArrowRightIcon;
    if (direction === 'left') {
      Cmp = AppIcons.ArrowLeftIcon;
    }
  }
  return (
    <Cmp className={classnames(classNameDefault, className)} {...others} />
  );
}

OneArrow.propTypes = {
  children: PropTypes.any,
};

export default OneArrow;
