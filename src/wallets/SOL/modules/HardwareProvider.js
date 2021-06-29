import HardwareProviderBase from '../../HardwareProviderBase';

class HardwareProvider extends HardwareProviderBase {
  async getAddress({ coin, bundle }) {
    return this.connect.hardwareGetAddressSOL({ coin, bundle });
  }
}

export default HardwareProvider;
