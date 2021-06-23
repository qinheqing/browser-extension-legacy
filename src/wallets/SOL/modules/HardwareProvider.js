import HardwareProviderBase from '../../HardwareProviderBase';

class HardwareProvider extends HardwareProviderBase {
  async getAddress({ coin, bundle }) {
    return this.connect.stellarGetAddress({ coin, bundle });
  }
}

export default HardwareProvider;
