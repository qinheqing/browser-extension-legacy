import React, { useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AppPageLayout from '../../components/AppPageLayout';
import OneInput from '../../components/OneInput';
import OneButton from '../../components/OneButton';
import { verifyPassword } from '../../../ui/app/store/actions';
import { useI18nContext } from '../../../ui/app/hooks/useI18nContext';
import utilsToast from '../../utils/utilsToast';
import storeWallet from '../../store/storeWallet';
import storeAccount from '../../store/storeAccount';
import CopyHandle from '../../components/CopyHandle';
import styles from './index.css';

function PagePrivateKeyExport() {
  const [privateKey, setPrivateKey] = useState('');
  const [pwd, setPwd] = useState('');
  const t = useI18nContext();
  useEffect(() => {
    return () => {
      setPrivateKey('');
      setPwd('');
    };
  }, []);

  return (
    <AppPageLayout title="导出私钥">
      <div className="flex flex-col p-4">
        <div className="text-red-500 text-sm">{t('privateKeyWarning')}</div>
        <div className="h-3" />
        {privateKey ? (
          <div className="text-sm bg-white rounded break-all p-4 text-center">
            <CopyHandle text={privateKey}>{privateKey}</CopyHandle>
          </div>
        ) : (
          <>
            <OneInput
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="输入密码"
            />
            <div className="h-3" />
            <OneButton
              onClick={async () => {
                try {
                  await verifyPassword(pwd);
                } catch (ex) {
                  utilsToast.toast.error('密码错误');
                  return;
                }
                const key =
                  await storeWallet.currentWallet.getAccountPrivateKey({
                    path: storeAccount.currentAccount.path,
                  });
                setPrivateKey(key);
                setPwd('');
              }}
              block
            >
              确认
            </OneButton>
          </>
        )}
      </div>
    </AppPageLayout>
  );
}

PagePrivateKeyExport.propTypes = {
  // children: PropTypes.any,
};

export default observer(PagePrivateKeyExport);
