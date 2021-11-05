import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import * as Sentry from '@sentry/browser';
import UIProvider from '@onekeyhq/ui-components/Provider';
import {
  I18nProvider,
  IntlI18nProvider,
  LegacyI18nProvider,
} from '../contexts/i18n';
import {
  TrackEventsContextProvider,
  LegacyTrackEventsContextProvider,
} from '../contexts/trackEvent';
import ForceSelectHwAccountProvider from '../contexts/ForceSelectHwAccountProvider';
import ErrorPage from './error';
import Routes from './routes';

class Index extends PureComponent {
  state = {};

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    Sentry.captureException(error);
  }

  render() {
    const { error, errorId } = this.state;
    const { store } = this.props;

    if (error) {
      return (
        <Provider store={store}>
          <IntlI18nProvider>
            <I18nProvider>
              <LegacyI18nProvider>
                <ErrorPage error={error} errorId={errorId} />
              </LegacyI18nProvider>
            </I18nProvider>
          </IntlI18nProvider>
        </Provider>
      );
    }

    return (
      <Provider store={store}>
        <UIProvider>
          <HashRouter hashType="noslash">
            <TrackEventsContextProvider>
              <LegacyTrackEventsContextProvider>
                <IntlI18nProvider>
                  <I18nProvider>
                    <LegacyI18nProvider>
                      <ForceSelectHwAccountProvider>
                        <Routes />
                      </ForceSelectHwAccountProvider>
                    </LegacyI18nProvider>
                  </I18nProvider>
                </IntlI18nProvider>
              </LegacyTrackEventsContextProvider>
            </TrackEventsContextProvider>
          </HashRouter>
        </UIProvider>
      </Provider>
    );
  }
}

Index.propTypes = {
  store: PropTypes.object,
};

export default Index;
