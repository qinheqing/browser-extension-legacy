import React from 'react';
import utilsApp from '../utils/utilsApp';
import storeHistory from '../store/storeHistory';
import OneButton from './OneButton';

function TxSubmitSuccessView({ txid, children }) {
  return (
    <div>
      {children}
      <div>
        <OneButton
          size="2xs"
          onClick={() => storeHistory.openBlockBrowserLink({ tx: txid })}
        >
          在区块浏览器查看
        </OneButton>
        <div>{utilsApp.shortenAddress(txid)}</div>
      </div>
    </div>
  );
}

export default TxSubmitSuccessView;
