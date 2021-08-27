import connectMockSOL from '../../utils/connectMockSOL';
import HardwareManagerBase from './HardwareManagerBase';

class HardwareManager extends HardwareManagerBase {
  async getAddress({ coin, bundle }) {
    return this.bgProxy.hardwareGetAddressSOL({ coin, bundle });
  }

  async signTransaction({ tx, hdPath }) {
    return await connectMockSOL.signTxMessageInHardware(tx, hdPath);
  }
}

export default HardwareManager;
