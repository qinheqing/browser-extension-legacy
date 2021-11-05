import React, { PureComponent, useState } from 'react';
import PropTypes from 'prop-types';
import logger from 'log/logger';
import availableCurrencies from '../../../helpers/constants/available-conversions.json';
import Dropdown from '../../../components/ui/dropdown';
import ToggleButton from '../../../components/ui/toggle-button';
import locales from '../../../../../app/_locales/index.json';
import { RESOLVE_CONFLICT_ONEKEY_NOT_REPLACING } from '../../../../../app/scripts/constants/consts';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../../helpers/constants/common';
import LanguageDropdown from './language-dropdown';

const sortedCurrencies = availableCurrencies.sort((a, b) => {
  return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
});

const currencyOptions = sortedCurrencies.map(({ code, name }) => {
  return {
    name: `${code.toUpperCase()} - ${name}`,
    value: code,
  };
});

const localeOptions = locales.map((locale) => {
  return {
    name: `${locale.name}`,
    value: locale.code,
  };
});

export default class SettingsTab extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    actionSetHwOnlyModeAsync: PropTypes.func,
    setUseBlockie: PropTypes.func,
    hwOnlyMode: PropTypes.bool,
    setUseAutoSwitchChain: PropTypes.func,
    setCurrentCurrency: PropTypes.func,
    warning: PropTypes.string,
    updateCurrentLocale: PropTypes.func,
    currentLocale: PropTypes.string,
    useBlockie: PropTypes.bool,
    useAutoSwitchChain: PropTypes.bool,
    currentCurrency: PropTypes.string,
    conversionDate: PropTypes.number,
    nativeCurrency: PropTypes.string,
    useNativeCurrencyAsPrimaryCurrency: PropTypes.bool,
    setUseNativeCurrencyAsPrimaryCurrencyPreference: PropTypes.func,
  };

  state = {
    conflictReplacingMetaMask: !localStorage.getItem(
      RESOLVE_CONFLICT_ONEKEY_NOT_REPLACING,
    ),
  };

  renderCurrentConversion() {
    const { t } = this.context;
    const { currentCurrency, conversionDate, setCurrentCurrency } = this.props;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{t('currencyConversion')}</span>
          <span className="settings-page__content-description">
            {t('updatedWithDate', [Date(conversionDate)])}
          </span>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <Dropdown
              id="select-currency"
              options={currencyOptions}
              selectedOption={currentCurrency}
              onChange={(newCurrency) => setCurrentCurrency(newCurrency)}
            />
          </div>
        </div>
      </div>
    );
  }

  renderBlockieOptIn() {
    const { t } = this.context;
    const { useBlockie, setUseBlockie } = this.props;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{this.context.t('blockiesIdenticon')}</span>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <ToggleButton
              value={useBlockie}
              onToggle={(value) => setUseBlockie(!value)}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </div>
      </div>
    );
  }

  renderAutoSwitchChainOptIn() {
    const { t } = this.context;
    const { useAutoSwitchChain, setUseAutoSwitchChain } = this.props;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{this.context.t('useAutoSwitchChain')}</span>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <ToggleButton
              value={useAutoSwitchChain}
              onToggle={(value) => setUseAutoSwitchChain(!value)}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </div>
      </div>
    );
  }

  renderHWOnlyOptIn() {
    const { t } = this.context;
    const { actionSetHwOnlyModeAsync, hwOnlyMode } = this.props;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{this.context.t('hwOnlyModeSwitch')}</span>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <ToggleButton
              value={hwOnlyMode}
              onToggle={async (value) => {
                const newVal = !value;
                await actionSetHwOnlyModeAsync(newVal);
              }}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </div>
      </div>
    );
  }

  renderConflictMetamaskOptIn() {
    const { t } = this.context;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{t('overwriteMetaMask')}</span>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <ToggleButton
              value={this.state.conflictReplacingMetaMask}
              onToggle={async (value) => {
                const newVal = !value;
                localStorage.setItem(
                  RESOLVE_CONFLICT_ONEKEY_NOT_REPLACING,
                  newVal ? '' : 'true',
                );

                this.setState({
                  conflictReplacingMetaMask: newVal,
                });
              }}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </div>
      </div>
    );
  }

  renderUsePrimaryCurrencyOptions() {
    const { t } = this.context;
    const {
      nativeCurrency,
      setUseNativeCurrencyAsPrimaryCurrencyPreference,
      useNativeCurrencyAsPrimaryCurrency,
    } = this.props;

    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{t('primaryCurrencySetting')}</span>
          <div className="settings-page__content-description">
            {t('primaryCurrencySettingDescription')}
          </div>
        </div>
        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col">
            <div className="settings-tab__radio-buttons">
              <div className="settings-tab__radio-button">
                <input
                  type="radio"
                  id="native-primary-currency"
                  onChange={() =>
                    setUseNativeCurrencyAsPrimaryCurrencyPreference(true)
                  }
                  checked={Boolean(useNativeCurrencyAsPrimaryCurrency)}
                />
                <label
                  htmlFor="native-primary-currency"
                  className="settings-tab__radio-label"
                >
                  {nativeCurrency}
                </label>
              </div>
              <div className="settings-tab__radio-button">
                <input
                  type="radio"
                  id="fiat-primary-currency"
                  onChange={() =>
                    setUseNativeCurrencyAsPrimaryCurrencyPreference(false)
                  }
                  checked={!useNativeCurrencyAsPrimaryCurrency}
                />
                <label
                  htmlFor="fiat-primary-currency"
                  className="settings-tab__radio-label"
                >
                  {t('fiat')}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { warning } = this.props;

    return (
      <div className="settings-page__body">
        {warning && <div className="settings-tab__error">{warning}</div>}
        {this.renderCurrentConversion()}
        {this.renderUsePrimaryCurrencyOptions()}
        <LanguageDropdown />
        {this.renderBlockieOptIn()}
        {this.renderAutoSwitchChainOptIn()}
        {this.renderHWOnlyOptIn()}
        {this.renderConflictMetamaskOptIn()}
      </div>
    );
  }
}

function ChangeLogLevelButton() {
  const [logLevel, setLogLevel] = useState(localStorage.getItem('loglevel'));
  if (!IS_ENV_IN_TEST_OR_DEBUG) {
    return null;
  }
  return (
    <div>
      <button
        onClick={() => {
          const levels = ['trace', 'debug', 'info', 'warn', 'error'];
          const level = logger.getLevel();
          const newLevel = levels[level + 1] ?? 'trace';
          logger.setLevel(newLevel);
          setLogLevel(newLevel);
          console.log(
            `logLevel saved in localStorage: loglevel=${localStorage.getItem(
              'loglevel',
            )}`,
            levels,
          );
        }}
      >
        Change LogLevel &gt; ({logLevel})
      </button>
    </div>
  );
}
