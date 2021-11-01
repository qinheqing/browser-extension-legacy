import classnames from 'classnames';
import React from 'react';
import OneCellItem from '../OneCellItem';

function OneFieldItem({
  title,
  titleWrapped = false,
  end,
  arrow = false,
  className,
  border = false,
  ...others
}) {
  const titleView = title && (
    <div
      className={classnames('text-sm inline-block', {
        'bg-gray-100 rounded-full px-2 py-0 ': titleWrapped,
      })}
    >
      {title}
    </div>
  );
  const endView = end && <div className="text-sm">{end}</div>;
  return (
    <OneCellItem
      title={titleView}
      end={endView}
      className={classnames('', className)}
      arrow={arrow}
      border={border}
      {...others}
    />
  );
}

export { OneFieldItem };
