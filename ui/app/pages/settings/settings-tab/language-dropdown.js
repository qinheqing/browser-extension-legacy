import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import locales from '../../../../../app/_locales';
import Dropdown from '../../../components/ui/dropdown';
import { updateCurrentLocale as updateCurrentLocaleAction } from '../../../store/actions';

const localeOptions = locales.map((locale) => {
  return {
    name: locale.name,
    value: locale.code,
  };
});

class LanguageDropdown extends React.Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    updateCurrentLocale: PropTypes.func,
    currentLocale: PropTypes.string,
    hideLabel: PropTypes.bool,
    showIcon: PropTypes.bool,
  };

  render() {
    const { t } = this.context;
    const { updateCurrentLocale, currentLocale, hideLabel, showIcon } =
      this.props;
    const currentLocaleMeta = locales.find(
      (locale) => locale.code === currentLocale,
    );
    const currentLocaleName = currentLocaleMeta ? currentLocaleMeta.name : '';

    return (
      <div className="settings-page__content-row">
        {!hideLabel && (
          <div className="settings-page__content-item">
            <span className="settings-page__content-label">
              {t('currentLanguage')}
            </span>
            <span className="settings-page__content-description">
              {currentLocaleName}
            </span>
          </div>
        )}

        <div className="settings-page__content-item">
          <div className="settings-page__content-item-col ">
            <div className="settings-page__lang">
              {showIcon && (
                <i className="fa fa-globe fa-lg00 settings-page__langIcon" />
              )}
              <Dropdown
                id="select-locale"
                options={localeOptions}
                selectedOption={currentLocale}
                onChange={async (newLocale) => updateCurrentLocale(newLocale)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const {
    metamask: { currentLocale },
  } = state;

  return {
    currentLocale,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentLocale: (key) => dispatch(updateCurrentLocaleAction(key)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageDropdown);
