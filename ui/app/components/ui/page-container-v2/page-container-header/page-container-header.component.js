import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../button';
import { ExtAppHeader } from '../../../../../../src/components/ExtAppHeader';
import ExtAppNavBar from '../../../../../../src/components/ExtAppNavBar';

export default class PageContainerHeader extends Component {
  static propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    onClose: PropTypes.func,
    showBackButton: PropTypes.bool,
    onBackButtonClick: PropTypes.func,
    backButtonStyles: PropTypes.object,
    backButtonString: PropTypes.string,
    tabs: PropTypes.node,
    headerCloseText: PropTypes.string,
    className: PropTypes.string,
  };

  renderTabs() {
    const { tabs } = this.props;

    return tabs && <ul className="page-container-v2__tabs">{tabs}</ul>;
  }

  renderHeaderRow() {
    const {
      showBackButton,
      onBackButtonClick,
      backButtonStyles,
      backButtonString,
    } = this.props;

    return (
      showBackButton && (
        <div className="page-container-v2__header-row">
          <span
            className="page-container-v2__back-button"
            onClick={onBackButtonClick}
            style={backButtonStyles}
          >
            {backButtonString || 'Back'}
          </span>
        </div>
      )
    );
  }

  render() {
    const {
      title,
      subtitle,
      onBackButtonClick,
      onClose,
      // ----
      tabs,
      backButtonStyles,
      className,
    } = this.props;

    return (
      <>
        <ExtAppNavBar
          onBackClick={onBackButtonClick}
          title={title}
          subTitle={subtitle}
        />
        {this.renderTabs()}
      </>
    );
  }
}
