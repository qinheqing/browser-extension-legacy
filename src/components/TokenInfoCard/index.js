import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';
import TokenBalance from '../TokenBalance';
import utilsApp from '../../utils/utilsApp';
import storeBalance from '../../store/storeBalance';
import storeWallet from '../../store/storeWallet';
import storeAccount from '../../store/storeAccount';
import utilsToast from '../../utils/utilsToast';
import { useCopyToClipboard } from '../../../ui/app/hooks/useCopyToClipboard';
import storeTransfer from '../../store/storeTransfer';
import { ROUTE_TRANSFER } from '../../routes/routeUrls';

// const ComponentSample = observer(ComponentSamplePure);

function TokenInfoCard({ token }) {
  const history = useHistory();
  const [copied, handleCopy] = useCopyToClipboard();
  return (
    <Observer>
      {() => {
        const { name, icon } = token;
        const tokenName =
          name || utilsApp.shortenAddress(token.contractAddress);
        return (
          <div className="TokenInfoCard">
            <div className="TokenInfoCard__content">
              <div className="TokenInfoCard__icon">{icon}</div>
              <div>
                {tokenName}

                <strong onClick={() => console.log(token)}> [INFO]</strong>
              </div>
              <div className="u-flex-child" />
              <TokenBalance tokenInfo={token} watchBalanceChange />
            </div>
            <div className="u-whitespace" />
            <div className="TokenInfoCard__footer">
              <button
                onClick={() => {
                  storeTransfer.fromToken = token;
                  history.push(ROUTE_TRANSFER);
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
              <span className="TokenInfoCard__address">
                {' '}
                {token.depositAddress}
              </span>
            </div>
          </div>
        );
      }}
    </Observer>
  );
}

TokenInfoCard.propTypes = {
  children: PropTypes.any,
};

export default TokenInfoCard;
