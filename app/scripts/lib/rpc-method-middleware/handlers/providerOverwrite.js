import log from 'src/log/logger';
import {
  METHOD_SET_OTHER_PROVIDER_STATUS,
  METHOD_GET_PROVIDER_OVERWRITE_ENABLED,
  RESOLVE_CONFLICT_ONEKEY_NOT_REPLACING,
} from '../../../constants/consts';

const handler1 = {
  methodNames: [METHOD_SET_OTHER_PROVIDER_STATUS],
  async implementation(req, res, _next, end) {
    try {
      log.info('METHOD_SET_OTHER_PROVIDER_STATUS', req.params?.[0]);
      res.result = true;
      return end();
    } catch (error) {
      return end(error);
    }
  },
};

const handler2 = {
  methodNames: [METHOD_GET_PROVIDER_OVERWRITE_ENABLED],
  async implementation(req, res, _next, end) {
    try {
      res.result = !localStorage.getItem(RESOLVE_CONFLICT_ONEKEY_NOT_REPLACING);
      return end();
    } catch (error) {
      return end(error);
    }
  },
};

export default [handler1, handler2];
