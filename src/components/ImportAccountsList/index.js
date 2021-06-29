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
import { CONSTS_ACCOUNT_TYPES } from '../../consts/consts';
import { ROUTE_WALLET_SELECT } from '../../routes/routeUrls';

// const ComponentSample = observer(ComponentSamplePure);

function ImportAccountItem({ account, wallet, disabled = false, onChange }) {
  const tokenInfo = new OneTokenInfo({
    isNative: true,
    address: account.address,
    chainKey: account.chainKey,
  });
  return (
    <div className="u-padding-x" key={account.address}>
      <hr />
      <input
        type="checkbox"
        disabled={disabled}
        checked={disabled ? true : undefined}
        onChange={onChange}
      />
      <div>{account.address}</div>
      <div>
        {account.path} ({account.hdPathIndex})
      </div>
      <TokenBalance
        tokenInfo={tokenInfo}
        wallet={wallet}
        showUnit
        updateBalanceThrottle={60 * 1000}
      />
    </div>
  );
}

const LOAD_SIZE = 30;
const PAGE_SIZE = 5;

function ImportAccountsList({ wallet, onLoadMore }) {
  const history = useHistory();
  const [accounts, setAccounts] = useState([]);
  const [page, setPage] = useState(1);
  const existsAccounts = useMemo(() => {
    return storeAccount.getAccountsByChainKey(wallet?.chainInfo?.key);
  }, [wallet?.chainInfo?.key]);
  const selectedAccounts = useMemo(() => {
    return {};
  }, []);
  const selectedAccountsLength = Object.keys(selectedAccounts).length;

  const doLoadMore = useCallback(async ({ start = 0, limit = LOAD_SIZE }) => {
    const _accounts = await onLoadMore({
      start,
      limit,
    });
    setAccounts((items) => [...items, ..._accounts]);
  }, []);

  const confirmImport = useCallback(() => {
    let accountNameIndex = existsAccounts.length;
    storeAccount.addAccounts(
      Object.values(selectedAccounts).map((addr) => {
        const { address, path, name, chainKey, type } = addr;
        accountNameIndex += 1;
        return {
          name: wallet.chainInfo.generateAccountName({
            index: accountNameIndex,
          }),
          chainKey,
          address,
          path,
          type,
        };
      }),
    );
    history.replace(ROUTE_WALLET_SELECT);
  }, []);

  const accountsPaged = accounts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    doLoadMore({ start: 0 });
  }, []);

  return (
    <Observer>
      {() => {
        return (
          <div>
            <div className="u-flex">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <button
                disabled={!accountsPaged.length}
                onClick={() => {
                  const newPage = page + 1;
                  if (newPage * PAGE_SIZE > accounts.length) {
                    doLoadMore({ start: accounts.length });
                  }
                  setPage(newPage);
                }}
              >
                Next
              </button>
              <div className="u-flex-child" />
              <button
                disabled={!selectedAccountsLength}
                onClick={confirmImport}
              >
                Confirm Import ({selectedAccountsLength})
              </button>
            </div>
            <hr />
            {!accountsPaged.length && <div>loading...</div>}
            {accountsPaged.map((account) => {
              const isExists = existsAccounts.find((item) => {
                // TODO same address, but type different, can we import it?
                //    item.address === account.address && item.type === account.type
                return item.address === account.address;
              });
              return (
                <ImportAccountItem
                  disabled={isExists}
                  key={account.address}
                  account={account}
                  wallet={wallet}
                  onChange={(event) => {
                    const { checked } = event.target;
                    if (checked) {
                      selectedAccounts[account.address] = account;
                    } else {
                      delete selectedAccounts[account.address];
                    }
                  }}
                />
              );
            })}
            <hr />

            <ReactJsonView src={selectedAccounts} />
            <ReactJsonView src={existsAccounts} />
          </div>
        );
      }}
    </Observer>
  );
}

ImportAccountsList.propTypes = {
  children: PropTypes.any,
};

export default ImportAccountsList;
