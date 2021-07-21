/**
 * Created by zuozhuo on 2021/7/19.
 */

'use strict';

import { ROUTE_HOME } from '../../routes/routeUrls';
import storeHistory from '../../store/storeHistory';

export default function useDataRequiredOrRedirect(
  data,
  { redirect = ROUTE_HOME } = {},
) {
  if (!data) {
    storeHistory.replace(redirect);
    return true;
  }
  return false;
}
