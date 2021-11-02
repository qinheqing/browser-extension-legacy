import React, { lazy, Suspense } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { createStandaloneNotification } from '@onekeyhq/ui-components/Notification';
import OneButton from '../components/OneButton';

let lastErrorData = {
  text: '',
  date: 0,
};

function ErrorToastView({ error }) {
  const { message, stack } = error;
  return (
    <div>
      <div>{message}</div>
      {stack && (
        <OneButton
          size="xs"
          type="gray"
          className="mt-1"
          onClick={() => stack && toast.info(stack)}
        >
          View details
        </OneButton>
      )}
    </div>
  );
}

function toastError(error = {}) {
  const errorString = (error?.message || '') + (error?.stack || '');
  const now = new Date().getTime();
  if (!errorString || error.IS_MUTE_NOTIFY) {
    return;
  }

  if (errorString !== lastErrorData.text || now > lastErrorData.date + 1000) {
    toast.error(<ErrorToastView error={error} />);
  }

  lastErrorData = {
    text: errorString,
    date: now,
  };
}

function toastTx({ message, txid }) {
  const TxSubmitSuccessViewLazy = lazy(() =>
    import('../components/TxSubmitSuccessView'),
  );
  toast.success(
    <Suspense fallback={<div />}>
      <TxSubmitSuccessViewLazy txid={txid}>{message}</TxSubmitSuccessViewLazy>
    </Suspense>,
  );
}

const notification = createStandaloneNotification();

export default {
  notification,
  toast,
  toastError,
  toastTx,
};
