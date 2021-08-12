import React, { Component, createContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { captureException } from '@sentry/browser';
import utilsApp from '../../../src/utils/utilsApp';

export const MetaMetricsContext = createContext(() => {
  captureException(
    Error(
      `MetaMetrics context function was called from a react node that is not a descendant of a MetaMetrics context provider`,
    ),
  );
});

export function MetaMetricsProvider({ children }) {
  const trackEvent = useCallback(() => {
    return utilsApp.trackEventNoop();
  }, []);

  return (
    <MetaMetricsContext.Provider
      value={{
        trackEvent,
        metricsEvent: trackEvent,
      }}
    >
      {children}
    </MetaMetricsContext.Provider>
  );
}

MetaMetricsProvider.propTypes = { children: PropTypes.node };

export class LegacyMetaMetricsProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: undefined,
  };

  static contextType = MetaMetricsContext;

  static childContextTypes = {
    trackEvent: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  getChildContext() {
    return this.context;
  }

  render() {
    return this.props.children;
  }
}
