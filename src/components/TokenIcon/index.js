import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import AppIcons from '../AppIcons';
import styles from './index.css';

function TokenIcon({ tokenInfo, size = 'md', className, children }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = tokenInfo?.logoURI || tokenInfo?.icon;
  useEffect(() => {
    if (imgSrc && imgError) {
      setImgError(false);
    }
  }, [imgSrc]);
  return (
    <div
      className={classnames(
        ' rounded-full overflow-hidden bg-gray-50 border border-gray-100 u-inline-flex-center',
        {
          'w-8 h-8': size === 'md',
          'w-6 h-6': size === 'sm',
        },
      )}
    >
      {(!imgSrc || imgError) && <AppIcons.QuestionIcon className="w-2.5" />}
      {!imgError && (
        <img
          onError={() => setImgError(true)}
          className="max-h-full max-w-full"
          src={`${imgSrc}`}
        />
      )}
    </div>
  );
}

TokenIcon.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenIcon);
