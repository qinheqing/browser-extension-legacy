import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { Token, TokenGroup } from '@onekeyhq/ui-components';
import AppIcons from '../AppIcons';
import storeChain from '../../store/storeChain';
import utilsApp from '../../utils/utilsApp';
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
      data-img-src={imgSrc || ''}
      className={classnames(
        'relative rounded-full overflow-hidden u-inline-flex-center',
        {
          'w-8 h-8': size === 'md',
          'w-6 h-6': size === 'sm',
          'bg-gray-50': !active,
          'bg-green-100': active,
          border,
        },
        border && (active ? 'border-green-600' : 'border-gray-100'),
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

function TokenLogoIconLegacy({ tokenInfo, size = 'md', className, ...others }) {
  const imgSrc = tokenInfo?.logoURI || tokenInfo?.icon;
  return (
    <LogoIcon size={size} src={imgSrc} className={className} {...others} />
  );
}

function TokenLogoIcon({
  tokenInfo = {},
  chainInfo,
  size = 'md',
  className,
  corner = true,
  ...others
}) {
  const { chainKey, contractAddress, logoURI, icon } = tokenInfo;
  // eslint-disable-next-line no-param-reassign
  chainInfo = chainInfo || storeChain.getChainInfoByKey(chainKey);
  let chainName =
    chainInfo?.baseChain || chainInfo?.chainIcon || chainInfo?.chainName;

  if (chainInfo?.isTestNet) {
    chainName = `t${chainName}`;
  }
  const imgSrc = logoURI || icon;
  const tokenProps = {
    chain: chainName,
    address: contractAddress,
    fallbackSrc: imgSrc,
    size,
    className,
    ...others,
  };
  if (corner) {
    return (
      <TokenGroup
        cornerToken={{
          chain: chainName,
        }}
        sources={[tokenProps]}
      />
    );
  }
  return <Token {...tokenProps} />;
}

export default LogoIcon;
export { ChainLogoIcon, TokenLogoIcon };
