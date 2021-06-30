import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

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
  toast.error(<ErrorToastView error={error} />);
}

export default {
  toast,
  toastError,
};
