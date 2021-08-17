import React, { Component, createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
// import { UIProvider } from '@onekeyhq/ui-components';
import { isArray } from 'lodash';
import { IntlProvider, useIntl } from 'react-intl';
import { getMessage } from '../helpers/utils/i18n-helper';
import { getCurrentLocale } from '../ducks/metamask/metamask';
import {
  getCurrentLocaleMessages,
  getDefaultLocaleMessages,
  getAllLocaleMessages,
} from '../ducks/locale/locale';

export const I18nContext = createContext((key) => `[${key}]`);

// RangeError: Incorrect locale information provided
function fixLocaleName(locale) {
  return locale === 'zh_CN' ? 'zh' : locale;
}

export const IntlI18nProvider = (props) => {
  const currentLocale = useSelector(getCurrentLocale);
  const currentMessages = useSelector(getCurrentLocaleMessages);
  return (
    <IntlProvider
      key={currentLocale}
      locale={fixLocaleName(currentLocale)}
      defaultLocale="en"
      messages={currentMessages}
    >
      {props.children}
    </IntlProvider>
  );
};

export const I18nProvider = (props) => {
  const intl = useIntl();
  const t = useMemo(() => {
    return (key, values) => {
      if (isArray(values)) {
        const valuesObj = {};
        values.forEach((value, i) => {
          // regex search keywords: \bt\(\'.*\'\s*,
          valuesObj[i + 1] = value;
        });
        // eslint-disable-next-line no-param-reassign
        values = valuesObj;
      }
      return intl.formatMessage(
        {
          id: key,
          defaultMessage: '',
          description: '',
        },
        values,
      );
    };
  }, [intl]);

  // const currentLocale = useSelector(getCurrentLocale);
  // const current = useSelector(getCurrentLocaleMessages);
  // const defaultLocale = useSelector(getDefaultLocaleMessages);
  //
  // const t = useMemo(() => {
  //   return (key, ...args) =>
  //     getMessage(currentLocale, current, key, ...args) ||
  //     getMessage(currentLocale, defaultLocale, key, ...args);
  // }, [currentLocale, current, defaultLocale]);

  return (
    <I18nContext.Provider value={t}>{props.children}</I18nContext.Provider>
  );
};

I18nProvider.propTypes = {
  children: PropTypes.node,
};

I18nProvider.defaultProps = {
  children: undefined,
};

export class LegacyI18nProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: undefined,
  };

  static contextType = I18nContext;

  static childContextTypes = {
    t: PropTypes.func,
  };

  getChildContext() {
    return {
      t: this.context,
    };
  }

  render() {
    return this.props.children;
  }
}
