import React from 'react';
import { observer } from 'mobx-react-lite';
import storeChain from '../store/storeChain';
import storeAccount from '../store/storeAccount';
import AmountText from './AmountText';
import OneDetailItem from './OneDetailItem';
import { OneField } from './OneField/OneField';
import { OneFieldItem } from './OneField/OneFieldItem';

const FeeInfoPanelInDappApproval = observer(function ({ feeInfo }) {
  const { decimals, currency } = storeAccount.currentAccountInfo;
  if (!feeInfo) {
    return null;
  }
  return (
    <>
      <OneDetailItem title="手续费">
        <AmountText
          value={feeInfo.fee}
          decimals={decimals}
          precision={Infinity}
        />
        <span className="ml-1">{currency}</span>
      </OneDetailItem>
      {feeInfo.gasPrice && (
        <>
          <OneDetailItem title="燃料价格">
            <span>
              {feeInfo.gasPrice}
              <span className="ml-1">
                {storeChain.currentNativeTokenUnitName}
              </span>
            </span>
          </OneDetailItem>

          <OneDetailItem title="燃料上限">
            <span>{feeInfo.gas}</span>
          </OneDetailItem>
        </>
      )}
    </>
  );
});

function FeeInfoPanel({ feeInfo }) {
  const { decimals, currency } = storeAccount.currentAccountInfo;
  if (!feeInfo) {
    return null;
  }
  return (
    <OneField>
      <OneFieldItem
        titleWrapped
        title="交易费"
        end={
          <span>
            <AmountText
              value={feeInfo.fee}
              decimals={decimals}
              precision={Infinity}
            />
            <span className="ml-1">{currency}</span>
          </span>
        }
      />
      {feeInfo.gasPrice && (
        <>
          <div className="-my-3">
            <OneFieldItem
              title="燃料价格"
              end={
                <span>
                  {feeInfo.gasPrice}
                  <span className="ml-1">
                    {storeChain.currentNativeTokenUnitName}
                  </span>
                </span>
              }
            />
          </div>

          <div className="-my-3">
            <OneFieldItem
              title="燃料上限"
              end={
                <span>
                  {feeInfo.gas}
                  {/* <span className="ml-1" />*/}
                </span>
              }
            />
          </div>
          <div className="h-4" />
        </>
      )}
    </OneField>
  );
}

export default observer(FeeInfoPanel);
export { FeeInfoPanelInDappApproval };
