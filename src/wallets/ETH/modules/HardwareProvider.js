import HardwareProviderBase from '../../HardwareProviderBase';

class HardwareProvider extends HardwareProviderBase {
  async getAddress({ coin, bundle }) {
    return this.connect.ethereumGetAddress({ coin, bundle });
  }
}

export default HardwareProvider;
