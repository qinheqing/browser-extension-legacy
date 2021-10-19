import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function ListItem({
  title,
  subtitle,
  onClick,
  children,
  titleIcon,
  icon,
  rightContent,
  midContent,
  className,
  'data-testid': dataTestId,
}) {
  const primaryClassName = classnames('list-v2-item', className);

  return (
    <div
      className={primaryClassName}
      onClick={onClick}
      data-testid={dataTestId}
    >
      {icon && <div className="list-v2-item__icon">{icon}</div>}
      <div className="list-v2-item__heading">
        {React.isValidElement(title) ? (
          title
        ) : (
          <button onClick={onClick}>
            <h2 className="list-v2-item__title">{title}</h2>
          </button>
        )}
        {titleIcon && (
          <div className="list-v2-item__heading-wrap">{titleIcon}</div>
        )}
      </div>
      {subtitle && <div className="list-v2-item__subheading">{subtitle}</div>}
      {children && <div className="list-v2-item__actions">{children}</div>}
      {midContent && (
        <div className="list-v2-item__mid-content">{midContent}</div>
      )}
      {rightContent && (
        <div className="list-v2-item__right-content">{rightContent}</div>
      )}
    </div>
  );
}

ListItem.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleIcon: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  icon: PropTypes.node,
  rightContent: PropTypes.node,
  midContent: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  'data-testid': PropTypes.string,
};
