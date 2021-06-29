import HardwareProviderBase from '../../HardwareProviderBase';

class HardwareProvider extends HardwareProviderBase {
  async getAddress({ coin, bundle }) {
    return this.connect.hardwareGetAddressETH({ coin, bundle });
  }
}

export default HardwareProvider;
