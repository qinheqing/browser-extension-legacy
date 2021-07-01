import React from 'react';

function TxSubmitSuccessView({ txid, children }) {
  return (
    <div>
      {children}
      <div>
        <button
          onClick={() =>
            window.open(
              `https://explorer.solana.com/tx/${txid}?cluster=testnet`,
            )
          }
        >
          View on explorer
        </button>
        {txid}
      </div>
    </div>
  );
}

export default TxSubmitSuccessView;
