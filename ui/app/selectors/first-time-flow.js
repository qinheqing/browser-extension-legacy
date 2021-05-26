import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE,
  DEFAULT_ROUTE,
} from '../helpers/constants/routes';
import { CONST_FIRST_TIME_FLOW_TYPES } from '../helpers/constants/common';

export function getFirstTimeFlowTypeRoute(state) {
  const { firstTimeFlowType } = state.metamask;

  let nextRoute;
  // firstTimeFlowType HW only
  if (firstTimeFlowType === CONST_FIRST_TIME_FLOW_TYPES.CONNECT_HW) {
    nextRoute = INITIALIZE_CREATE_PASSWORD_ROUTE;
  } else if (firstTimeFlowType === CONST_FIRST_TIME_FLOW_TYPES.CREATE) {
    nextRoute = INITIALIZE_CREATE_PASSWORD_ROUTE;
  } else if (firstTimeFlowType === CONST_FIRST_TIME_FLOW_TYPES.IMPORT) {
    nextRoute = INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE;
  } else {
    nextRoute = DEFAULT_ROUTE;
  }

  return nextRoute;
}

export const getOnboardingInitiator = (state) => {
  const { onboardingTabs } = state.metamask;

  if (!onboardingTabs || Object.keys(onboardingTabs).length !== 1) {
    return null;
  }

  const location = Object.keys(onboardingTabs)[0];
  const tabId = onboardingTabs[location];
  return {
    location,
    tabId,
  };
};
