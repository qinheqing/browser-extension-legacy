import HardwareProviderBase from '../../HardwareProviderBase';

class HardwareProvider extends HardwareProviderBase {
  async getAddress({ coin, bundle }) {
    return this.connect.getAddress({ coin, bundle });
  }
}

export default HardwareProvider;
