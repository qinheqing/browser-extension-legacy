import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useI18nContext } from '../../../hooks/useI18nContext';

const Popover = ({
  title,
  subtitle = '',
  children,
  footer,
  footerClassName,
  onBack,
  onClose,
  className,
  contentClassName,
  showArrow,
  showHeader,
  CustomBackground,
}) => {
  const t = useI18nContext();
  return (
    <div className="popover-v2-container">
      {CustomBackground ? (
        <CustomBackground onClose={onClose} />
      ) : (
        <div className="popover-v2-bg" onClick={onClose} />
      )}
      <section className={classnames('popover-v2-wrap', className)}>
        {showArrow ? <div className="popover-v2-arrow" /> : null}
        {showHeader && (
          <header className="popover-v2-header">
            <div className="popover-v2-header__title">
              <h2 title={title}>
                {onBack ? (
                  <button
                    className="fas fa-chevron-left popover-v2-header__button"
                    title={t('back')}
                    onClick={onBack}
                  />
                ) : null}
                {title}
              </h2>
              <button
                className="fas fa-times popover-v2-header__button"
                title={t('close')}
                onClick={onClose}
              />
            </div>
            {subtitle ? (
              <p className="popover-v2-header__subtitle">{subtitle}</p>
            ) : null}
          </header>
        )}
        {children ? (
          <div className={classnames('popover-v2-content', contentClassName)}>
            {children}
          </div>
        ) : null}
        {footer ? (
          <footer className={classnames('popover-v2-footer', footerClassName)}>
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
};

Popover.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  CustomBackground: PropTypes.func,
  contentClassName: PropTypes.string,
  className: PropTypes.string,
  showArrow: PropTypes.bool,
};

export default class PopoverPortal extends PureComponent {
  static propTypes = Popover.propTypes;

  rootNode = document.getElementById('popover-content');

  instanceNode = document.createElement('div');

  componentDidMount() {
    if (!this.rootNode) {
      return;
    }

    this.rootNode.appendChild(this.instanceNode);
  }

  componentWillUnmount() {
    if (!this.rootNode) {
      return;
    }

    this.rootNode.removeChild(this.instanceNode);
  }

  render() {
    const children = <Popover {...this.props} />;
    return this.rootNode
      ? ReactDOM.createPortal(children, this.instanceNode)
      : children;
  }
}
