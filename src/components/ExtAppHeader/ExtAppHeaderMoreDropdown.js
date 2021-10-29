import { Dropdown } from '@onekeyhq/ui-components';
import React from 'react';

export function ExtAppHeaderMoreDropdown() {
  return (
    <Dropdown
      place="bottom-end"
      sections={[
        {
          items: [
            {
              content: 'Add Liquidity',
              icon: 'PlusSolid',
              onAction: undefined,
            },
            {
              content: 'Remove Liquidity',
              icon: 'MinusSolid',
            },
          ],
        },
        {
          items: [
            {
              content: 'Filter in Farm',
              icon: 'ExternalLinkSolid',
            },
          ],
        },
      ]}
    />
  );
}
