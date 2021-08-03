import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
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

  renderOverlay() {
    const { onOverlayClose } = this.props;

    return (
      <div
        className="sidebar-overlay"
        onClick={() => {
          onOverlayClose?.();
          this.props.hideSidebar();
        }}
      />
    );
  }

  renderSidebarContent() {
    const { type, sidebarProps = {} } = this.props;
    const { transaction = {} } = sidebarProps;
    switch (type) {
      case 'customize-gas':
        return (
          <div className="sidebar-left">
            <CustomizeGas transaction={transaction} />
          </div>
        );
      default:
        return null;
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.sidebarShouldClose && this.props.sidebarShouldClose) {
      this.props.hideSidebar();
    }
  }

  render() {
    const { transitionName, sidebarOpen, sidebarShouldClose } = this.props;

    return (
      <div>
        <CSSTransition
          classNames={transitionName}
          timeout={{ exit: 200, enter: 300 }}
        >
          <>
            {sidebarOpen && !sidebarShouldClose
              ? this.renderSidebarContent()
              : null}
          </>
        </CSSTransition>
        {sidebarOpen && !sidebarShouldClose ? this.renderOverlay() : null}
      </div>
    );
  }
}
