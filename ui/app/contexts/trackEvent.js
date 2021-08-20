import React, { Component, createContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { captureException } from '@sentry/browser';
import utilsApp from '../../../src/utils/utilsApp';

export const TrackEventsContext = createContext(() => {
  captureException(
    Error(
      `TrackEvents context function was called from a react node that is not a descendant of a TrackEvents context provider`,
    ),
  );
});

export function TrackEventsContextProvider({ children }) {
  const trackEvent = useCallback(() => {
    return utilsApp.trackEventNoop();
  }, []);

  return (
    <TrackEventsContext.Provider
      value={{
        trackEvent,
        metricsEvent: trackEvent,
      }}
    >
      {children}
    </TrackEventsContext.Provider>
  );
}

TrackEventsContextProvider.propTypes = { children: PropTypes.node };

export class LegacyTrackEventsContextProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: undefined,
  };

  static contextType = TrackEventsContext;

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
