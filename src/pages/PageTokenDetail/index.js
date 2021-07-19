import React from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import AppPageLayout from '../../components/AppPageLayout';
import storeToken from '../../store/storeToken';
import storeHistory from '../../store/storeHistory';
import TokenBalance from '../../components/TokenBalance';
import OneButton from '../../components/OneButton';
import TokenIcon from '../../components/TokenIcon';
import TokenDepositQrcode from '../../components/TokenDepositQrcode';
import TokenAmountInPrice from '../../components/TokenAmountInPrice';
import useRequiredData from '../../utils/hooks/useRequiredData';

function PageTokenDetail() {
  const token = storeToken.currentDetailToken;
  if (
    !useRequiredData({
      data: token,
    })
  ) {
    return <div />;
  }
  return (
    <AppPageLayout
      title={
        <span onClick={() => console.log(token)}>{token.symbolOrName}</span>
      }
      whiteBg={false}
      navRight={<TokenIcon tokenInfo={token} />}
      footer={
        <div className="flex items-center px-4 pt-2 pb-4 bg-white">
          <OneButton
            block
            type="secondary"
            onClick={() => storeHistory.goToPageTransfer({ token })}
          >
            转账
          </OneButton>
          <div className="w-6" />
          <OneButton block type="primary">
            收款
          </OneButton>
        </div>
      }
    >
      <div className="flex items-center flex-col py-8">
        <TokenBalance
          className="text-xl"
          classNamePrice="text-gray-400 text-sm"
          tokenInfo={token}
          showUnit
          watchBalanceChange
          showPrice
        />
      </div>
      <TokenDepositQrcode tokenInfo={token} />
    </AppPageLayout>
  );
}

PageTokenDetail.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageTokenDetail);
