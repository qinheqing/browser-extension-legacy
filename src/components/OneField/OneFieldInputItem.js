import React from 'react';
import OneInput from '../OneInput';
import { OneFieldItem } from './OneFieldItem';

function OneFieldInputItem({
  value,
  onChange,
  placeholder,
  inputProps,
  border,
  ...others
}) {
  return (
    <OneFieldItem border={border} {...others}>
      <OneInput
        bgTransparent
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...inputProps}
      />
    </OneFieldItem>
  );
}

export { OneFieldInputItem };
