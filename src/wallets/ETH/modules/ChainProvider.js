import { ethers } from 'ethers';
import ChainProviderBase from '../../ChainProviderBase';
import OneAccountInfo from '../../../classes/OneAccountInfo';

class ChainProvider extends ChainProviderBase {
  constructor(options) {
    super(options);

    // TODO rpc length check
    const rpcUrl = options?.chainInfo?.rpc?.[0];

    this.connection = new ethers.providers.JsonRpcProvider(rpcUrl);

    // TODO remove
    global.$$chainETH = this;
  }

  normalizeAccountInfo(info) {
    return new OneAccountInfo({
      balance: info?.balance,
      decimals: this.options.balanceDecimals,
    });
  }

  addAccountChangeListener() {
    console.log('ETH addAccountChangeListener');
  }

  removeAccountChangeListener(id) {
    console.log('ETH removeAccountChangeListener');
  }

  async getAccountInfo({ address }) {
    const balanceBigNumber = await this.connection.getBalance(address);
    return this.normalizeAccountInfo({ balance: balanceBigNumber.toString() });
  }
}

export default ChainProvider;
