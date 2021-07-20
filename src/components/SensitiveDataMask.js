import { observer } from 'mobx-react-lite';
import React from 'react';

function SensitiveDataMask({ mask = '****', hide = undefined, children }) {
  return hide ? <div>{mask}</div> : children;
}

export default observer(SensitiveDataMask);
