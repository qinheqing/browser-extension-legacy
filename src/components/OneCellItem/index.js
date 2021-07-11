import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import TimeAgo from 'react-timeago';
import AppIcons from '../AppIcons';
import styles from './index.css';

function OneCellItem({
  start,
  end,
  title,
  content,
  arrow,
  border = true,
  appearance = 'flat',
  children,
  className,
  onClick,
  noPaddingX = false,
  noPaddingY = false,
  ...others
}) {
  const isCard = appearance === 'card';
  const isFlat = appearance === 'flat';
  return (
    <div
      onClick={onClick}
      className={classnames(
        'flex items-stretch bg-white',
        {
          'px-4': isFlat,
          'px-3 my-2 mx-3 border rounded-lg': isCard,
          'cursor-pointer hover:bg-gray-50': Boolean(onClick),
          'u-px-none': noPaddingX,
        },
        className,
      )}
      {...others}
    >
      {start && <div className="pr-2 u-flex-center">{start}</div>}
      <div
        className={classnames('flex-1 flex', {
          'border-b': isFlat && border,
          'py-3': isCard,
          'py-2.5': isFlat,
          'u-py-none': noPaddingY,
        })}
      >
        <div className="flex-1 flex flex-col justify-center">
          <div className="">{title || children}</div>
          {content && (
            <div className="mt-1 text-xs text-gray-400">{content}</div>
          )}
        </div>

        {end && (
          <div className="pl-2 u-flex-center text-xs text-gray-400 ">{end}</div>
        )}
        {arrow && <AppIcons.ChevronRightIcon className="w-4 text-gray-300" />}
      </div>
    </div>
  );
}

OneCellItem.propTypes = {
  children: PropTypes.any,
};

export default observer(OneCellItem);
