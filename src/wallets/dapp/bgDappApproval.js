import { CONST_CHAIN_KEYS } from '../../consts/consts';
import backgroundProxy from '../bg/backgroundProxy';

async function openApprovalPopup(request) {
  return new Promise((resolve, reject) => {
    const { origin, baseChain } = request;
    if (!baseChain) {
      throw new Error('openApprovalPopup error: request.baseChain not defined');
    }
    const key = backgroundProxy.dappApprovalMethods.saveApproval({
      baseChain,
      origin,
      resolve,
      reject,
    });
    global.$ok_openApprovalPopup({
      baseChain,
      request,
      key,
    });
  });
}

export default {
  openApprovalPopup,
};
