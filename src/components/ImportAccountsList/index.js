import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import { slice } from 'lodash';
import { useHistory } from 'react-router-dom';
import TokenBalance from '../TokenBalance';
import storeAccount from '../../store/storeAccount';
import OneTokenInfo from '../../classes/OneTokenInfo';
import ReactJsonView from '../ReactJsonView';
import { CONST_ACCOUNT_TYPES } from '../../consts/consts';
import { ROUTE_HOME, ROUTE_WALLET_SELECT } from '../../routes/routeUrls';
import OneButton from '../OneButton';
import storeChain from '../../store/storeChain';
import AppIcons from '../AppIcons';
import storeHistory from '../../store/storeHistory';

// const ComponentSample = observer(ComponentSamplePure);

function ImportAccountItem({
  account,
  wallet,
  disabled = false,
  onChange,
  defaultChecked,
}) {
  const tokenInfo = new OneTokenInfo({
    isNative: true,
    address: account.address,
    chainKey: account.chainKey,
    symbol: wallet.chainInfo?.currency,
  });
  const displayIndex = account.hdPathIndex + 1;
  return (
    <div
      className="bg-white py-3 px-4 -mx-4 border-b flex items-center"
      key={account.address}
    >
      <div className="self-start flex flex-col items-center mr-4">
        <span className="text-center bg-gray-300 p-1 mb-2 rounded leading-none text-xs min-w-[18px]">
          {displayIndex}
        </span>
        <input
          className="transform scale-150"
          defaultChecked={defaultChecked}
          type="checkbox"
          disabled={disabled}
          checked={disabled ? true : undefined}
          onChange={onChange}
        />
      </div>

      <div className="flex-1">
        <div className="break-all text-sm leading-none">{account.address}</div>
        <small className="text-gray-400 text-xs">{account.path}</small>
        <div className="flex items-center justify-between text-sm leading-none">
          <TokenBalance
            tokenInfo={tokenInfo}
            wallet={wallet}
            showUnit
            updateBalanceThrottle={60 * 1000}
          />
          <AppIcons.ExternalLinkIcon
            onClick={() =>
              storeHistory.openBlockBrowserLink({
                wallet,
                account: account.address,
              })
            }
            role="button"
            className="w-4"
          />
        </div>
      </div>
    </div>
  );
}

const LOAD_SIZE = 15;
const PAGE_SIZE = 5;

function ImportAccountsList({ wallet, onLoadMore }) {
  const [accounts, setAccounts] = useState([]);
  const [updateHook, setUpdateHook] = useState(0);
  const [page, setPage] = useState(1);
  const existsAccounts = useMemo(() => {
    return storeAccount.getAccountsByChainKey(wallet?.chainInfo?.key);
  }, [wallet?.chainInfo?.key]);
  const selectedAccounts = useMemo(() => {
    return {};
  }, []);
  const selectedAccountsLength = Object.keys(selectedAccounts).length;

  const doLoadMore = useCallback(
    async ({ start = 0, limit = LOAD_SIZE }) => {
      const _accounts = await onLoadMore({
        start,
        limit,
      });
      setAccounts((items) => [...items, ..._accounts]);
    },
    [onLoadMore],
  );

  const confirmImport = useCallback(() => {
    let accountNameIndex = existsAccounts.length;
    const accountsSorted = Object.values(selectedAccounts).sort((a, b) =>
      a.hdPathIndex < b.hdPathIndex ? -1 : 1,
    );
    const newAccounts = accountsSorted.map((addr) => {
      accountNameIndex += 1;
      // TODO init data from initFirstAccount() and buildAddressMeta()
      const account = { ...addr };
      account.name = wallet.chainInfo.generateAccountName({
        index: accountNameIndex,
      });
      return account;
    });

    storeAccount.addAccounts(newAccounts);
    storeAccount.setCurrentAccount({ account: newAccounts[0] });
    storeHistory.goBack({
      fallbackUrl: ROUTE_HOME,
    });
  }, [existsAccounts.length, selectedAccounts, wallet?.chainInfo]);

  const accountsPaged = accounts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    doLoadMore({ start: 0 });
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center">
        <OneButton
          type="secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ?????????
        </OneButton>
        <div className="w-2" />
        <OneButton
          type="secondary"
          disabled={!accountsPaged.length}
          onClick={() => {
            const newPage = page + 1;
            if (newPage * PAGE_SIZE > accounts.length) {
              doLoadMore({ start: accounts.length });
            }
            setPage(newPage);
          }}
        >
          ?????????
        </OneButton>
        <div className="flex-1" />
        <OneButton
          key={`btn-import-${updateHook}`}
          type="primary"
          disabled={!selectedAccountsLength}
          onClick={confirmImport}
        >
          ???????????? ({selectedAccountsLength})
        </OneButton>
      </div>
      <div className="h-4" />
      {!accountsPaged.length && (
        <div className="text-center py-40">?????????...</div>
      )}
      {accountsPaged.map((account) => {
        const isExists = existsAccounts.find((item) => {
          // TODO same address, but type different, can we import it?
          //      item.address === account.address && item.type === account.type
          return item.address === account.address;
        });
        const defaultChecked = Boolean(selectedAccounts[account.address]);
        return (
          <ImportAccountItem
            disabled={isExists}
            key={account.address}
            account={account}
            wallet={wallet}
            defaultChecked={defaultChecked}
            onChange={(event) => {
              const { checked } = event.target;
              if (checked) {
                selectedAccounts[account.address] = account;
              } else {
                delete selectedAccounts[account.address];
              }
              // as checkbox is not controlled component
              // so we need force update parent component
              setUpdateHook(new Date().getTime());
            }}
          />
        );
      })}
    </div>
  );
}

ImportAccountsList.propTypes = {
  children: PropTypes.any,
};

export default observer(ImportAccountsList);
