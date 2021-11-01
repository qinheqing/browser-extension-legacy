import React, { useCallback, useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AppPageLayout from '../../components/AppPageLayout';
import utilsStorage from '../../utils/utilsStorage';
import storeApproveSettings from '../../store/storeApproveSettings';
import utilsApp from '../../utils/utilsApp';
import OneDetailItem from '../../components/OneDetailItem';
import utilsDate from '../../utils/utilsDate';
import LoadingSpinner from '../../components/LoadingSpinner';
import useLoadingCallback from '../../hooks/useLoadingCallback';
import { OneDetailItemGroup } from '../../components/OneDetailItemGroup';
import { OneField } from '../../components/OneField/OneField';
import { OneFieldItem } from '../../components/OneField/OneFieldItem';
import styles from './index.css';

function DeleteLink({ onClick, ...others }) {
  const [onClickNew, loading] = useLoadingCallback(onClick);

  if (loading) {
    return <LoadingSpinner className="w-4" />;
  }
  return (
    <a
      onClick={onClickNew}
      className="text-blue-600 cursor-pointer"
      {...others}
    />
  );
}

function ApproveAccount({ account, origin }) {
  const { address, baseChain } = account;
  return (
    <OneFieldItem
      border
      title={baseChain}
      end={
        <DeleteLink
          onClick={() =>
            storeApproveSettings.deleteSetting({ origin, account })
          }
        >
          删除
        </DeleteLink>
      }
      // content={utilsApp.shortenAddress(address)}
      content={<div className="u-break-words">{address}</div>}
    />
  );
}

function ApproveOrigin({ originInfo }) {
  const { origin, lastUpdate, accounts } = originInfo;
  return (
    <OneField>
      <OneFieldItem
        border
        title={<strong className="u-break-words">{origin}</strong>}
        end={
          <DeleteLink
            onClick={() => storeApproveSettings.deleteSetting({ origin })}
          >
            全部删除
          </DeleteLink>
        }
        // content={<div>最近访问 {utilsDate.formatDate(new Date(lastUpdate))}</div>}
      />
      {accounts.map((account, i) => (
        <ApproveAccount key={i} account={account} origin={origin} />
      ))}
    </OneField>
  );
}

function PageApproveSettings() {
  useEffect(() => {
    storeApproveSettings.fetchSettings();
  }, []);
  return (
    <AppPageLayout title="网站授权管理">
      <div className="">
        {!storeApproveSettings.settingsList.length && (
          <div className="text-center text-lg p-4">暂无任何网站授权</div>
        )}
        {storeApproveSettings.settingsList.map((item) => {
          return <ApproveOrigin key={item.origin} originInfo={item} />;
        })}
      </div>
    </AppPageLayout>
  );
}

PageApproveSettings.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageApproveSettings);
