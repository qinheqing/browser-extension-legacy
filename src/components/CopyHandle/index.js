import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import Copy from '../../../ui/app/components/ui/icon/copy-icon.component';
import Tooltip from '../../../ui/app/components/ui/tooltip';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import AppIcons from '../AppIcons';
import styles from './index.css';

function CopyHandle({ text, children }) {
  const [copied, handleCopy] = useCopyToClipboard();
  return (
    <Tooltip position="bottom" title={copied ? '复制成功' : '复制到剪切板'}>
      <span
        role="button"
        className=""
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(text);
        }}
      >
        {children && (
          <span>
            <span>{children}</span>
            <span className="mr-1" />
          </span>
        )}
        <AppIcons.DuplicateIcon className="w-4 inline align-middle" />
      </span>
    </Tooltip>
  );
}

CopyHandle.propTypes = {
  children: PropTypes.any,
};

export default observer(CopyHandle);
