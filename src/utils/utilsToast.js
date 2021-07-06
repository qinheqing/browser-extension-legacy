import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

let lastErrorData = {
  text: '',
  date: 0,
};

function ErrorToastView({ error }) {
  const { message, stack } = error;
  return (
    <div>
      <div>{message}</div>
      <button onClick={() => stack && toast.info(stack)}>View details</button>
    </div>
  );
}

function toastError(error = {}) {
  const errorString = (error?.message || '') + (error?.stack || '');
  const now = new Date().getTime();
  if (
    !errorString ||
    errorString !== lastErrorData.text ||
    now > lastErrorData.date + 1000
  ) {
    toast.error(<ErrorToastView error={error} />);
  }
  lastErrorData = {
    text: errorString,
    date: now,
  };
}

export default {
  toast,
  toastError,
};
