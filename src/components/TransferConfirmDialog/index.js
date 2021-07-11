import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { Dialog, Transition } from '@headlessui/react';
import AppIcons from '../AppIcons';
import OneDialog from '../OneDialog';
import storeTransfer from '../../store/storeTransfer';
import OneDetailItem from '../OneDetailItem';
import styles from './index.css';

function TransferConfirmDialog({ open, onOpenChange }) {
  return (
    <OneDialog
      overlayClose={false}
      open={open}
      title="交易详情"
      confirmText="确认支付"
      onOpenChange={onOpenChange}
      onConfirm={() => storeTransfer.doTransfer().then((txid) => Boolean(txid))}
    >
      <div className="text-2xl text-black">
        {storeTransfer.amount} {storeTransfer.symbolDisplay}
      </div>
      <div className="divide-y divide-gray-200 mt-3">
        <OneDetailItem title="发送方">
          <div className="break-all">{storeTransfer.fromAddress}</div>
        </OneDetailItem>
        <OneDetailItem title="接收方">
          <div className="break-all">{storeTransfer.toAddress}</div>
        </OneDetailItem>
        <OneDetailItem title="类型">转账</OneDetailItem>
        <OneDetailItem title="交易费">
          {storeTransfer.fee} {storeTransfer.feeSymbol}
        </OneDetailItem>
      </div>
    </OneDialog>
  );
}

TransferConfirmDialog.propTypes = {
  children: PropTypes.any,
};

export default observer(TransferConfirmDialog);
