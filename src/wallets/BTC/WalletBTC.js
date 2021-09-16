import ethUtil from 'ethereumjs-util';
import WalletBase from '../WalletBase';
import utilsApp from '../../utils/utilsApp';
import { CONST_CHAIN_KEYS } from '../../consts/consts';
import HardwareProviderETH from './modules/HardwareProvider';
import ChainProviderETH from './modules/ChainProvider';
import HdKeyProviderETH from './modules/HdKeyProvider';

class WalletBTC extends WalletBase {
  // TODO move to optionsDefault
  get hdCoin() {
    return CONST_CHAIN_KEYS.BTC;
  }

  get optionsDefault() {
    return {
      balanceDecimals: 18,
      // TODO change template format to m/44'/60'/0'/0/i
      // TODO multiple template support
      hdPathTemplate: `m/49'/0'/{{index}}'/0/0`, // SegWit
      // hdPathTemplate: `m/84'/0'/{{index}}'/0/0`, // Native SegWit
      // hdPathTemplate: `m/44'/0'/{{index}}'/0/0`, // Lagacy
    };
  }

  hardwareProvider = new HardwareProviderETH(this.options);

  chainProvider = new ChainProviderETH(this.options);

  hdkeyProvider = new HdKeyProviderETH(this.options);

  publicKeyToAddress({ publicKey }) {
    const publicKeyBytes = Buffer.from(publicKey, 'hex');
    const addr = ethUtil.publicToAddress(publicKeyBytes, true).toString('hex');
    return ethUtil.toChecksumAddress(`0x${addr}`);
  }
}

export default WalletBTC;
