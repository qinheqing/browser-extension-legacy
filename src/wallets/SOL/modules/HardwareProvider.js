import HardwareProviderBase from '../../HardwareProviderBase';
import connectMockSOL from '../../../utils/connectMockSOL';

class HardwareProvider extends HardwareProviderBase {
  async getAddress({ coin, bundle }) {
    return this.bgProxy.hardwareGetAddressSOL({ coin, bundle });
  }

  async signTransaction({ tx, hdPath }) {
    return await connectMockSOL.signTxMessageInHardware(tx, hdPath);
  }
}

export default HardwareProvider;
