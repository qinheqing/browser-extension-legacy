import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import TokenBalance from '../TokenBalance';
import utilsApp from '../../utils/utilsApp';
import storeBalance from '../../store/storeBalance';
import storeWallet from '../../store/storeWallet';

// const ComponentSample = observer(ComponentSamplePure);

function TokenInfoCard({ token }) {
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
              <TokenBalance tokenKey={token.key} address={token.address} />
            </div>
            <div className="u-whitespace" />
            <div className="TokenInfoCard__footer">
              <button
                onClick={() => {
                  const { decimals } = storeBalance.getBalanceInfoByKey(
                    token.key,
                  );
                  const to = global.prompt(
                    'transfer 0.01 to',
                    '6NuMY8tuAEbaysLbf2DX2Atuw24a5dpFvBJUu9Tundek',
                  );
                  if (to) {
                    storeWallet.currentWallet.transfer({
                      amount: '0.01',
                      decimals,
                      from: token.address,
                      to,
                      contract: token.contractAddress,
                      isToken: !token.isNative,
                    });
                  }
                }}
              >
                Transfer
              </button>
              <button
                onClick={() => {
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
