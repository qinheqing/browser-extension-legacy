import { useContext, useCallback } from 'react';
import { MetaMetricsContext } from '../contexts/metametrics';

export function useMetricEvent(config = {}, overrides = {}) {
  const context = useContext(MetaMetricsContext);
  return context.trackEvent;
}
