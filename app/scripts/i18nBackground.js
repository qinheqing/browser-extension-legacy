import { fetchLocale } from '../../ui/app/helpers/utils/i18n-helper';

let locale = 'en';
const localeMessages = {};

async function init(_locale) {
  const enLocaleMessages = await fetchLocale('en');
  const zhLocaleMessages = await fetchLocale('zh_CN');
  localeMessages.en = enLocaleMessages;
  localeMessages.zh_CN = zhLocaleMessages;
  setCurrentLocale(_locale);
}

function t(key) {
  return localeMessages?.[locale]?.[key] || key;
}

function setCurrentLocale(_locale, direction) {
  if (_locale === 'zh' || _locale === 'zh-cn' || _locale === 'zh-CN') {
    // eslint-disable-next-line no-param-reassign
    _locale = 'zh_CN';
  }
  locale = _locale;
}

function getCurrentLocale() {
  return locale;
}

export default {
  t,
  init,
  setCurrentLocale,
  getCurrentLocale,
};
