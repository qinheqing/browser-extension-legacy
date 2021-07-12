import React, { useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AppPageLayout from '../../components/AppPageLayout';
import OneInput from '../../components/OneInput';
import storeWallet from '../../store/storeWallet';
import OneCellItem from '../../components/OneCellItem';
import utilsApp from '../../utils/utilsApp';
import OneButton from '../../components/OneButton';
import storeToken from '../../store/storeToken';
import NoDataView from '../../components/NoDataView';
import OneDialog from '../../components/OneDialog';
import TokenIcon from '../../components/TokenIcon';
import TokenBalance from '../../components/TokenBalance';
import AmountText from '../../components/AmountText';
import storeAccount from '../../store/storeAccount';
import styles from './index.css';

function TokenAddItem({ token, onAddClick }) {
  /*
  address: "So11111111111111111111111111111111111111112"
  chainId: 102
  decimals: 9
  extensions: {website: "https://www.solana.com/", coingeckoId: "solana"}
  logoURI: "https://raw.githubusercontent.com/solana-labs/...logo.png"
  name: "Wrapped SOL"
  symbol: "wSOL"
  tags: []
   */
  return (
    <OneCellItem
      start={<TokenIcon tokenInfo={token} />}
      title={
        <span>
          {token.symbol || '未知币种'}{' '}
          {token.name && <span>({token.name})</span>}
        </span>
      }
      content={utilsApp.shortenAddress(token.address)}
      end={
        <OneButton onClick={() => onAddClick(token)} size="xs">
          添加
        </OneButton>
      }
    />
  );
}

function PageTokenAdd() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [tokenToAdd, setTokenToAdd] = useState({});
  const [fee, setFee] = useState(null);
  useEffect(() => {
    storeToken.fetchAllTokenList();
    storeWallet.currentWallet.chainProvider
      .getAddAssociateTokenFee()
      .then((_fee) => setFee(_fee));
    return () => {
      storeToken.tokenListFiltered = null;
    };
  }, []);
  const { tokenListFiltered, allTokenList } = storeToken;
  const tokens = tokenListFiltered || allTokenList;
  return (
    <AppPageLayout title="添加代币">
      <div className="px-4 py-2">
        <OneInput
          icon="search"
          placeholder="输入代币名称或地址"
          onChange={(event) => {
            storeToken.filterTokenList({
              text: event.target.value,
            });
          }}
        />
      </div>
      <div>
        {tokenListFiltered && !tokenListFiltered.length && <NoDataView />}
        {/* TODO lazy load or pagination, fixed px height, title overflow ellipse */}
        {tokens.map((token) => (
          <TokenAddItem
            key={token.address}
            token={token}
            onAddClick={(_token) => {
              setTokenToAdd(_token);
              setAddDialogOpen(true);
            }}
          />
        ))}
      </div>
      <OneDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title={
          <div>
            <div>添加 {tokenToAdd.symbol || '未知币种'}</div>
            <div className="text-sm text-gray-400">
              {utilsApp.shortenAddress(tokenToAdd.address)}
            </div>
          </div>
        }
        // TODO token fee display
        content={
          <div>
            需要支付 {/* TODO to TokenAmountText*/}
            <AmountText
              value={fee}
              decimals={storeAccount.currentAccount.decimals}
            />{' '}
            {storeAccount.currentAccount.currency} 添加代币
          </div>
        }
        confirmText="确认添加"
        onConfirm={async () => {
          return storeToken.addAssociateToken({ contract: tokenToAdd.address });
        }}
      />
    </AppPageLayout>
  );
}

PageTokenAdd.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageTokenAdd);
