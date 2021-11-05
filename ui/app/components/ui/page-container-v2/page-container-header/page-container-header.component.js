import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../button';

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
      onClose,
      tabs,
      headerCloseText,
      onBackButtonClick,
      backButtonStyles,
      className,
    } = this.props;

    return (
      <div
        className={classnames('page-container-v2__header', className, {
          'page-container-v2__header--no-padding-bottom': Boolean(tabs),
        })}
      >
        <div className="page-container-v2__sub-header">
          <span
            className="page-container-v2__back-button"
            onClick={onBackButtonClick}
            style={backButtonStyles}
          >
            <img src="./images/caret-left-black.svg" />
            <div className="page-container-v2__divider" />
          </span>
          <div className="page-container-v2__header-content">
            {title && <div className="page-container-v2__title">{title}</div>}
            {subtitle && (
              <div className="page-container-v2__subtitle">{subtitle}</div>
            )}
          </div>
        </div>
        {this.renderTabs()}
      </div>
    );
  }
}
