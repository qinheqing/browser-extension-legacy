import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';
import TokenBalance from '../TokenBalance';
import utilsApp from '../../utils/utilsApp';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import storeTransfer from '../../store/storeTransfer';
import { ROUTE_TRANSFER } from '../../routes/routeUrls';
import TokenIcon from '../TokenIcon';
import storeHistory from '../../store/storeHistory';

function TokenInfoCard({ token, onClick }) {
  const history = useHistory();
  const [copied, handleCopy] = useCopyToClipboard();

  const { symbol, name, icon } = token;
  const tokenName = symbol || name || token.contractAddressShort;
  return (
    <div className="-mx-4 hover:bg-gray-50 cursor-pointer" onClick={onClick}>
      <div className="flex items-center h-16 px-4">
        <TokenIcon className="mr-2" />
        <div className="text-lg relative" onClick={() => console.log(token)}>
          {tokenName}
          {!symbol && (
            <small className="absolute text-xs text-gray-300 left-0 top-full">
              {token.contractAddressShort}
            </small>
          )}
        </div>
        <div className="flex-1" />
        <div className="text-right">
          <TokenBalance
            className="text-base"
            tokenInfo={token}
            watchBalanceChange
          />
          <div className="text-xs text-gray-400">$ 0.0000</div>
        </div>
      </div>
      <div className="ml-12 border-b" />
      <div className="TokenInfoCard__footer hidden">
        <button
          onClick={() => {
            storeHistory.goToPageTransfer({ token });
          }}
        >
          Transfer
        </button>
        <button
          onClick={() => {
            handleCopy(token.depositAddress);
            utilsToast.toast(
              <div>
                <div>Copied address</div>
                <strong style={{ fontWeight: 'bold' }}>
                  {token.depositAddress}
                </strong>
              </div>,
            );
            console.log(token.depositAddress);
          }}
        >
          Deposit
        </button>
        <span className="TokenInfoCard__address"> {token.depositAddress}</span>
      </div>
    </div>
  );
}

TokenInfoCard.propTypes = {
  children: PropTypes.any,
};

export default observer(TokenInfoCard);
