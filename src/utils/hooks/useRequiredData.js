/**
 * Created by zuozhuo on 2021/7/19.
 */

'use strict';

import { ROUTE_HOME } from '../../routes/routeUrls';
import storeHistory from '../../store/storeHistory';

export default function useRequiredData({ data, redirect = ROUTE_HOME }) {
  if (!data) {
    storeHistory.replace(redirect);
    return false;
  }
  return true;
}
