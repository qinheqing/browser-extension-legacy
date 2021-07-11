import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { Dialog, Transition } from '@headlessui/react';
import { noop } from 'lodash';
import AppIcons from '../AppIcons';
import OneButton from '../OneButton';
import styles from './index.css';

function OneDialog({
  overlayClose = true,
  icon,
  title,
  content,
  confirmText,
  onConfirm = noop,
  open = true,
  onOpenChange = noop,
  children,
  actionsView,
}) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const bodyView = (
    <div className="">
      {icon && (
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 ">
          <AppIcons.ExclamationIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="mt-3 text-center">
        {title && (
          <Dialog.Title
            as="h3"
            className="text-md leading-6 font-medium text-gray-900"
          >
            {title}
          </Dialog.Title>
        )}
        <div className="mt-2">
          <div className="text-sm text-gray-500">{children || content}</div>
        </div>
      </div>
    </div>
  );
  const footerView = (
    <div className="mt-5">
      {actionsView || (
        <>
          <OneButton
            block
            type="primary"
            size="xl"
            disabled={confirmLoading}
            onClick={async () => {
              try {
                setConfirmLoading(true);
                const _open = await onConfirm();
                onOpenChange(Boolean(_open));
              } finally {
                setConfirmLoading(false);
              }
            }}
          >
            {confirmText || '确认'}
          </OneButton>
          <div className="h-3" />
          <OneButton
            block
            type="white"
            size="xl"
            onClick={() => onOpenChange(false)}
          >
            取消
          </OneButton>
        </>
      )}
    </div>
  );
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        open={open}
        onClose={overlayClose ? onOpenChange : noop}
      >
        <div className="flex items-center justify-center min-h-screen py-4 px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 "
            enterTo="opacity-100 translate-y-0 "
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 "
            leaveTo="opacity-0 translate-y-4 "
          >
            <div className="w-80 inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all ">
              {/* close button */}
              <div className="block absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 outline-none"
                  onClick={() => onOpenChange(false)}
                >
                  <span className="sr-only">Close</span>
                  <AppIcons.XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* dialog body */}
              {bodyView}

              {/* dialog footer actions */}
              {footerView}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

OneDialog.propTypes = {
  children: PropTypes.any,
};

export default observer(OneDialog);
