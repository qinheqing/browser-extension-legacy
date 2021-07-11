import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';

function OneButton({
  size = 'md',
  type = 'secondary',
  block = false,
  rounded = false,
  icon,
  iconAfter,
  className,
  disabled,
  onClick,
  children,
  ...others
}) {
  const cls = [];
  cls.push(
    'items-center border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50',
  );
  cls.push(
    {
      primary: classnames(
        'border-transparent text-white bg-green-one-600 focus:ring-green-one-500 ',
        {
          'hover:bg-green-one-700': !disabled,
        },
      ),
      secondary: classnames(
        'border-transparent text-green-one-700 bg-green-one-100 focus:ring-green-one-500 ',
        {
          'hover:bg-green-one-200': !disabled,
        },
      ),
      white: classnames('border-gray-300 text-gray-900 bg-white ', {
        'hover:bg-gray-50': !disabled,
      }),
      gray: classnames('border-gray-300 text-gray-900 bg-gray-100 ', {
        'hover:bg-gray-200': !disabled,
      }),
    }[type],
  );
  cls.push(
    classnames({
      'rounded-full': rounded,
      'inline-flex': !block,
      'flex w-full text-center justify-center': block,
    }),
  );
  cls.push(
    {
      '2xs': classnames('text-xs font-medium rounded', {
        'p-0.5': rounded,
        'px-1.5 py-1 ': !rounded,
      }),
      xs: classnames('text-xs font-medium rounded', {
        'p-1': rounded,
        'px-2.5 py-1.5 ': !rounded,
      }),
      sm: classnames('text-sm leading-4 font-medium rounded-md', {
        'p-1.5': rounded,
        'px-3 py-2 ': !rounded,
      }),
      md: classnames(' text-sm font-medium rounded-md', {
        'p-2': rounded,
        'px-4 py-2': !rounded,
      }),
      lg: classnames(' text-base font-medium rounded-md', {
        'p-2': rounded,
        'px-4 py-2': !rounded,
      }),
      xl: classnames(' text-base font-medium rounded-md', {
        'p-2.5': rounded,
        'px-4.5 py-2.5': !rounded,
      }),
    }[size],
  );

  return (
    <button
      disabled={disabled}
      className={classnames(cls, {}, className)}
      onClick={onClick}
      {...others}
    >
      {children}
    </button>
  );
}

OneButton.propTypes = {
  children: PropTypes.any,
};

export default observer(OneButton);
