import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import qrCode from 'qrcode-generator';
import CopyHandle from '../CopyHandle';
import { TokenLogoIcon } from '../LogoIcon';
import styles from './index.css';

function TokenDepositQrcode({ tokenInfo, children }) {
  const qrImage = useMemo(() => {
    if (!tokenInfo?.address) {
      return null;
    }
    const qr = qrCode(4, 'M');
    qr.addData(tokenInfo?.address);
    qr.make();
    return qr;
  }, [tokenInfo?.address]);

  if (!tokenInfo) {
    return 'Token info not found';
  }

  return (
    <div className="bg-white p-8 flex flex-col items-center mx-4 rounded-2xl">
      <div className="flex items-center text-xs text-gray-400">
        <TokenLogoIcon tokenInfo={tokenInfo} size="sm" />
        <div className="w-2" />
        <span>扫一扫转入 {tokenInfo.symbolDisplay}</span>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: qrImage && qrImage.createTableTag(4),
        }}
      />
      <div className="text-xs text-gray-400 mb-2">账户地址</div>
      <div className="text-xs break-all text-center">
        <CopyHandle text={tokenInfo.depositAddress}>
          {tokenInfo.depositAddress}
        </CopyHandle>
      </div>
    </div>
  );
}

TokenDepositQrcode.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenDepositQrcode);
