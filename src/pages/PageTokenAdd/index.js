import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import LazyLoad from 'react-lazyload';
import AppPageLayout from '../../components/AppPageLayout';
import OneInput from '../../components/OneInput';
import storeWallet from '../../store/storeWallet';
import OneCellItem from '../../components/OneCellItem';
import utilsApp from '../../utils/utilsApp';
import OneButton from '../../components/OneButton';
import storeToken from '../../store/storeToken';
import NoDataView from '../../components/NoDataView';
import OneDialog from '../../components/OneDialog';
import TokenBalance from '../../components/TokenBalance';
import AmountText from '../../components/AmountText';
import storeAccount from '../../store/storeAccount';
import { TokenLogoIcon } from '../../components/LogoIcon';
import CopyHandle from '../../components/CopyHandle';
import styles from './index.css';

const TokenAddItem = observer(function ({ token, onAddClick }) {
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
  const symbol = storeToken.correctTokenSymbol(token);
  const hasAdded = storeToken.currentTokens.find(
    (item) => item.contractAddress === token.address,
  );
  return (
    <OneCellItem
      start={<TokenLogoIcon tokenInfo={token} />}
      title={
        <span>
          {symbol || '未知币种'} {token.name && <span>({token.name})</span>}
        </span>
      }
      content={
        <CopyHandle text={token.address}>
          {utilsApp.shortenAddress(token.address)}
        </CopyHandle>
      }
      end={
        hasAdded ? (
          <OneButton disabled size="xs">
            已添加
          </OneButton>
        ) : (
          <OneButton onClick={() => onAddClick(token)} size="xs">
            添加
          </OneButton>
        )
      }
    />
  );
});

function PageTokenAdd() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [tokenToAdd, setTokenToAdd] = useState({});
  const [fee, setFee] = useState(null);
  const scrollContainer = useRef(null);
  const triggerScrollEvent = useCallback(() => {
    scrollContainer.current &&
      // trigger container scroll event to force lazyload refresh.
      scrollContainer.current.dispatchEvent(new Event('scroll'));
  }, []);

  useEffect(() => {
    scrollContainer.current = document.querySelector(
      '.OneKey-AppPageLayoutBody',
    );
    storeToken.fetchAllTokenListMeta().then(triggerScrollEvent);
    storeWallet.currentWallet.chainProvider
      .getAddAssociateTokenFee()
      .then(setFee);
    return () => {
      storeToken.tokenListFiltered = null;
    };
  }, [triggerScrollEvent]);
  const { tokenListFiltered, allTokenListMeta, recommended } = storeToken;
  const tokens = tokenListFiltered || recommended || allTokenListMeta;

  return (
    <AppPageLayout title="添加代币">
      <div className="px-4 py-2">
        <OneInput
          icon="search"
          placeholder="输入代币名称或地址"
          onChange={(event) => {
            storeToken.filterTokenList({
              text: event.target.value,
              callback: triggerScrollEvent,
            });
          }}
        />
      </div>
      <div>
        {tokenListFiltered && !tokenListFiltered.length && <NoDataView />}
        {/* TODO lazy load or pagination, fixed px height, title overflow ellipse */}
        {scrollContainer.current && (
          <div>
            {tokens.map((token) => (
              <LazyLoad
                // scrollContainer={scrollContainer.current}
                key={token.address}
                height={65}
                once
                overflow
              >
                <TokenAddItem
                  key={token.address}
                  token={token}
                  onAddClick={(_token) => {
                    setTokenToAdd(_token);
                    setAddDialogOpen(true);
                  }}
                />
              </LazyLoad>
            ))}
          </div>
        )}
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
