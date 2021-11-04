/**
 * Created by zuozhuo on 2021/7/19.
 */

'use strict';

import { ROUTE_HOME, ROUTE_HOME_OLD } from '../../routes/routeUrls';
import storeHistory from '../../store/storeHistory';
import utilsApp from '../utilsApp';

export default function useDataRequiredOrRedirect(data, { redirect } = {}) {
  // eslint-disable-next-line no-param-reassign
  redirect = redirect || (utilsApp.isNewHome() ? ROUTE_HOME : ROUTE_HOME_OLD);
  if (!data) {
    storeHistory.replace(redirect);
    return true;
  }
  return false;
}
