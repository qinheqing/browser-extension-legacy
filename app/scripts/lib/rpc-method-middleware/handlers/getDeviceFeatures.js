import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

async function implementation(req, res, _next, end, { getDeviceFeatures }) {
  try {
    res.result = await getDeviceFeatures(req);
    return end();
  } catch (error) {
    return end(error);
  }
}

export default {
  methodNames: [MESSAGE_TYPE.GET_DEVICE_FEATURES],
  implementation,
};
