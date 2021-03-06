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
import useLoadingCallback from '../../hooks/useLoadingCallback';
import storeChain from '../../store/storeChain';
import styles from './index.css';

const TokenAddItem = observer(function ({ token, onAddClick }) {
  const tokenInfo = {
    ...token,
    chainKey: token.chainKey || storeChain.currentChainKey,
    contractAddress: token.contractAddress || token.address,
  };

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
  const [onAddClickWithLoading, loading] = useLoadingCallback(() =>
    onAddClick(token),
  );
  const symbol = storeToken.correctTokenSymbol(token);
  const hasAdded = storeToken.currentTokens.find(
    (item) => item.contractAddress === token.address,
  );
  return (
    <OneCellItem
      start={<TokenLogoIcon tokenInfo={tokenInfo} />}
      title={
        <span>
          {symbol || '????????????'} {token.name && <span>({token.name})</span>}
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
            ?????????
          </OneButton>
        ) : (
          <OneButton
            loading={loading}
            onClick={onAddClickWithLoading}
            size="xs"
          >
            ??????
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

  const wallet = storeWallet.currentWallet;
  const handleAddTokenClick = useCallback(
    async (_token) => {
      let meta = {};
      try {
        meta = await wallet.chainManager.fetchTokenMeta({
          address: _token.address,
        });
      } catch (error) {
        console.error(error);
      }

      console.log('handleAddTokenClick', meta);
      setTokenToAdd({
        ..._token,
        ...meta,
      });
      setAddDialogOpen(true);
    },
    [wallet.chainManager, wallet],
  );

  useEffect(() => {
    scrollContainer.current = document.querySelector(
      '.OneKey-AppPageLayoutBody',
    );
    storeToken.fetchAllTokenListMeta().then(triggerScrollEvent);
    storeWallet.currentWallet.chainManager
      .getAddAssociateTokenFee()
      .then(setFee);

    return () => {
      storeToken.tokenListFiltered = null;
    };
  }, [triggerScrollEvent]);
  const { tokenListFiltered, allTokenListMeta, recommended } = storeToken;
  const tokens = tokenListFiltered || recommended || allTokenListMeta;

  return (
    <AppPageLayout title="????????????">
      <div className="px-4 py-2">
        <OneInput
          icon="search"
          placeholder="???????????????????????????"
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
                  onAddClick={handleAddTokenClick}
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
            <div>?????? {tokenToAdd.symbol || '????????????'}</div>
            <div className="text-sm text-gray-400">
              {utilsApp.shortenAddress(tokenToAdd.address)}
            </div>
          </div>
        }
        // TODO token fee display
        content={
          fee > 0 && (
            <div>
              ???????????? {/* TODO to TokenAmountText*/}
              <AmountText
                value={fee}
                decimals={storeAccount.currentAccountInfo.decimals}
              />{' '}
              {storeAccount.currentAccountInfo.currency} ????????????
            </div>
          )
        }
        confirmText="????????????"
        onConfirm={async () => {
          return storeToken.addAssociateToken(
            {
              ...tokenToAdd,
            },
            fee,
          );
        }}
      />
    </AppPageLayout>
  );
}

PageTokenAdd.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageTokenAdd);
