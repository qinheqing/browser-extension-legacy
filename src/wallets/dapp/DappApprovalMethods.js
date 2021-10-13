import utilsApp from '../../utils/utilsApp';

class DappApprovalMethods {
  approvalMaps = {};

  generateKey({ baseChain, origin, id }) {
    return `${baseChain}__${origin}__${id}`;
  }

  saveApproval({ baseChain, origin, resolve, reject }) {
    const id = utilsApp.uuid();
    const key = this.generateKey({ baseChain, origin, id });
    this.approvalMaps[key] = {
      resolve,
      reject,
      created: Date.now(),
    };
    return key;
  }

  removeApproval(key) {
    if (key) {
      delete this.approvalMaps[key];
    }
  }

  resolve({ key, data }) {
    if (this.approvalMaps[key]) {
      this.approvalMaps[key].resolve(data);
    }
    this.removeApproval(key);
  }

  reject({ key, data }) {
    if (this.approvalMaps[key]) {
      this.approvalMaps[key].reject(data);
    }
    this.removeApproval(key);
  }

  onUnlockedChanged(payload) {
    global._storeDappApproval.onUnlockedChanged(payload);
  }

  onAccountsChanged(payload) {
    global._storeDappApproval.onAccountsChanged(payload);
  }

  onChainChanged() {
    global._storeDappApproval.onChainChanged();
  }
}

export default DappApprovalMethods;
