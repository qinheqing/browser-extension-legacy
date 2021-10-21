import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import Popover from '../../ui/popover-beta';
import CustomizeGas from '../gas-customization/gas-modal-page-container';

export default class Sidebar extends Component {
  static propTypes = {
    sidebarOpen: PropTypes.bool,
    hideSidebar: PropTypes.func,
    sidebarShouldClose: PropTypes.bool,
    transitionName: PropTypes.string,
    type: PropTypes.string,
    sidebarProps: PropTypes.object,
    onOverlayClose: PropTypes.func,
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.sidebarShouldClose && this.props.sidebarShouldClose) {
      this.props.hideSidebar();
    }
  }

  render() {
    const { sidebarOpen, hideSidebar, sidebarProps = {} } = this.props;
    const { transaction = {} } = sidebarProps;

    return (
      sidebarOpen && (
        <Popover onClose={hideSidebar}>
          <CustomizeGas transaction={transaction} />
        </Popover>
      )
    );
  }
}
