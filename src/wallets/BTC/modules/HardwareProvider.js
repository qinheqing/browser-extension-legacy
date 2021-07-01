import HardwareProviderBase from '../../HardwareProviderBase';

class HardwareProvider extends HardwareProviderBase {
  async getAddress({ coin, bundle }) {
    return this.bgProxy.hardwareGetAddress({ coin, bundle });
  }
}

export default HardwareProvider;
