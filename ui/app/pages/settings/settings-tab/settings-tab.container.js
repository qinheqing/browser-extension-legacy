import { connect } from 'react-redux';
import {
  setCurrentCurrency,
  setUseBlockie,
  setUseAutoSwitchChain,
  updateCurrentLocale,
  setUseNativeCurrencyAsPrimaryCurrencyPreference,
  actionSetHwOnlyModeAsync,
} from '../../../store/actions';
import { getPreferences } from '../../../selectors';
import SettingsTab from './settings-tab.component';

const mapStateToProps = (state) => {
  const {
    appState: { warning },
    metamask,
  } = state;
  const {
    currentCurrency,
    conversionDate,
    nativeCurrency,
    useBlockie,
    useAutoSwitchChain,
    currentLocale,
    hwOnlyMode,
  } = metamask;
  const { useNativeCurrencyAsPrimaryCurrency } = getPreferences(state);

  return {
    warning,
    currentLocale,
    currentCurrency,
    conversionDate,
    nativeCurrency,
    useBlockie,
    hwOnlyMode,
    useAutoSwitchChain,
    useNativeCurrencyAsPrimaryCurrency,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentCurrency: (currency) => dispatch(setCurrentCurrency(currency)),
    setUseBlockie: (value) => dispatch(setUseBlockie(value)),
    setUseAutoSwitchChain: (value) => dispatch(setUseAutoSwitchChain(value)),
    updateCurrentLocale: (key) => dispatch(updateCurrentLocale(key)),
    setUseNativeCurrencyAsPrimaryCurrencyPreference: (value) => {
      return dispatch(setUseNativeCurrencyAsPrimaryCurrencyPreference(value));
    },
    actionSetHwOnlyModeAsync: (val) => dispatch(actionSetHwOnlyModeAsync(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
