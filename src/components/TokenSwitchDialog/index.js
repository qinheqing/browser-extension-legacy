import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { Dialog, Transition } from '@headlessui/react';
import { cloneDeep } from 'lodash';
import AppIcons from '../AppIcons';
import OneDialog from '../OneDialog';
import storeTransfer from '../../store/storeTransfer';
import storeToken from '../../store/storeToken';
import OneCellItem from '../OneCellItem';
import { TokenLogoIcon } from '../LogoIcon';

function TokenOption({ token, onClick, checked = false }) {
  const { symbol } = token;
  const { name, icon } = token;
  const tokenName = token.symbolOrName || token.contractAddressShort;

  const end = checked ? (
    <div className="text-right">
      <AppIcons.CheckIcon className="w-4 h-4" />
    </div>
  ) : (
    <span className="w-4 h-4" />
  );

  return (
    <OneCellItem
      className="px-4"
      onClick={() => onClick(token)}
      start={<TokenLogoIcon tokenInfo={token} className="" />}
      end={end}
      title={<div className="text-lg relative">{tokenName}</div>}
    />
  );
}

function TokenSwitchDialog({ open, onOpenChange }) {
  const tokens = storeToken.currentTokens;
  const { fromToken } = storeTransfer;

  const [selectedAddress, setSelectedAddress] = useState(fromToken.address);

  const onConfirm = (selected) => {
    if (selected) {
      storeTransfer.fromToken = cloneDeep(selected);
      onOpenChange(false);
    }
  };

  return (
    <OneDialog
      overlayClose={false}
      open={open}
      title="选择资产"
      confirmText="确认"
      onOpenChange={onOpenChange}
      actionsView={<span />}
    >
      <div className="py-3 -mx-4 ">
        {tokens.map((token, index) => {
          return (
            <TokenOption
              key={token.contractAddress + index}
              token={token}
              onClick={(e) => onConfirm(e)}
              checked={fromToken.address === token.address}
            />
          );
        })}
      </div>
    </OneDialog>
  );
}

TokenSwitchDialog.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenSwitchDialog);
