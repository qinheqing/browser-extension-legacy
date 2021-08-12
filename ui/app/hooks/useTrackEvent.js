import { useContext, useCallback } from 'react';
import { TrackEventsContext } from '../contexts/trackEvent';

export function useTrackEvent(config = {}, overrides = {}) {
  const context = useContext(TrackEventsContext);
  return context.trackEvent;
}
