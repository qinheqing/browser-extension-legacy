import React, { Component, useContext } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import AppPageLayout from '../../components/AppPageLayout';
import { I18nContext } from '../../../ui/app/contexts/i18n';
import {
  GENERAL_ROUTE,
  SETTINGS_ROUTE,
} from '../../../ui/app/helpers/constants/routes';
import OneCellItem from '../../components/OneCellItem';
import styles from './index.css';

class I18nTextClassComponent extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    return (
      <div className="px-4">
        <OneCellItem>
          {this.context.t('verifyThisTokenOn', [
            <strong key={1} style={{ color: 'green' }}>
              硬件设备
            </strong>,
          ])}
        </OneCellItem>
      </div>
    );
  }
}
function I18nTextFunctionComponent() {
  const intl = useIntl();
  const t = useContext(I18nContext);
  return (
    <div className="px-4">
      <OneCellItem>
        {intl.formatMessage(
          {
            id: 'web3ShimUsageNotification',
            defaultMessage: 'Accept Terms Of Use',
          },
          {
            1: <strong style={{ color: 'red' }}>链接</strong>,
          },
        )}
      </OneCellItem>

      <OneCellItem>
        {t('acceptTermsOfUse', [
          <strong key={1} style={{ color: 'green' }}>
            补充条款
          </strong>,
        ])}
      </OneCellItem>
    </div>
  );
}

function PageDemoI18n() {
  return (
    <AppPageLayout title="OneKey">
      <Link to={GENERAL_ROUTE}>切换语言 &gt;</Link>
      <button onClick={() => window.abd389234.bbb7732923}>抛异常测试</button>
      <hr />
      <I18nTextFunctionComponent />
      <I18nTextClassComponent />
    </AppPageLayout>
  );
}

PageDemoI18n.propTypes = {
  // children: PropTypes.any,
};

export default observer(PageDemoI18n);
