import classnames from 'classnames';
import React from 'react';

function OneDetailItemGroup({ children, divide = true, className }) {
  return (
    <div
      className={classnames(
        {
          'divide-y': divide,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

export { OneDetailItemGroup };
