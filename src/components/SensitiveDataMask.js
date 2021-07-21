import { observer } from 'mobx-react-lite';
import React from 'react';
import storeStorage from '../store/storeStorage';

function SensitiveDataMask({ mask = '****', hide = undefined, children }) {
  const _hide = hide === undefined ? storeStorage.maskAssetBalance : hide;
  return _hide ? <span>{mask}</span> : children;
}

export default observer(SensitiveDataMask);
