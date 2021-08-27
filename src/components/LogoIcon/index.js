import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import AppIcons from '../AppIcons';
import storeChain from '../../store/storeChain';
import styles from './index.css';

function LogoIcon({
  src,
  size = 'md', // md sm
  border = true,
  active = false,
  label = '',
  className,
}) {
  const imgSrc = src;
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    if (imgSrc && imgError) {
      setImgError(false);
    }
  }, [imgSrc]);
  return (
    <div
      className={classnames(
        'relative rounded-full overflow-hidden u-inline-flex-center',
        {
          'w-8 h-8': size === 'md',
          'w-6 h-6': size === 'sm',
          'bg-gray-50': !active,
          'bg-green-100': active,
          'border border-gray-100': border,
        },
        className,
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
      {label && (
        <div className="absolute bottom-0 left-0 right-0 h-1/3 u-flex-center leading-none bg-green-one-600 bg-opacity-50 text-white">
          <span className="text-sm scale-50">{label}</span>
        </div>
      )}
    </div>
  );
}

LogoIcon.propTypes = {
  children: PropTypes.any,
};

const ChainLogoIcon = observer(function ({
  chainInfo,
  size,
  className,
  ...others
}) {
  // eslint-disable-next-line no-param-reassign
  chainInfo = chainInfo || storeChain.currentChainInfo;
  const imgSrc = chainInfo?.chainLogo;
  return (
    <LogoIcon
      size={size}
      src={imgSrc}
      className={className}
      label={chainInfo.isTestNet && 'Test'}
      {...others}
    />
  );
});

function TokenLogoIcon({ tokenInfo, size = 'md', className, ...others }) {
  const imgSrc = tokenInfo?.logoURI || tokenInfo?.icon;
  return (
    <LogoIcon size={size} src={imgSrc} className={className} {...others} />
  );
}

export default LogoIcon;
export { ChainLogoIcon, TokenLogoIcon };
