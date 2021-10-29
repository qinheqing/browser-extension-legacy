import React from 'react';
import { observer } from 'mobx-react-lite';
import { ExtChainSelector } from './ExtChainSelector';
import { ExtAccountSelector } from './ExtAccountSelector';
import { ExtAppHeaderMoreDropdown } from './ExtAppHeaderMoreDropdown';

function ExtAppHeader() {
  return (
    <div className="flex items-center px-2">
      <ExtChainSelector />
      <div className="flex-1" />
      <ExtAccountSelector />
      <div className="flex-1" />
      <ExtAppHeaderMoreDropdown />
    </div>
  );
}

export default observer(ExtAppHeader);
