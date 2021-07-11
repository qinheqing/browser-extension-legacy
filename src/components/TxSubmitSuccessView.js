import React from 'react';
import utilsApp from '../utils/utilsApp';
import OneButton from './OneButton';

function TxSubmitSuccessView({ txid, children }) {
  return (
    <div>
      {children}
      <div>
        <OneButton
          size="2xs"
          onClick={() =>
            // TODO use browser template in chainInfo
            window.open(
              `https://explorer.solana.com/tx/${txid}?cluster=testnet`,
            )
          }
        >
          在区块浏览器查看
        </OneButton>
        <div>{utilsApp.shortenAddress(txid)}</div>
      </div>
    </div>
  );
}

export default TxSubmitSuccessView;
