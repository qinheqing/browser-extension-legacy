import ethUtil from 'ethereumjs-util';
import TrezorKeyring from '@onekeyhq/eth-onekey-keyring';
import WalletBase from '../WalletBase';
import utilsApp from '../../utils/utilsApp';
import { CONST_CHAIN_KEYS } from '../../consts/consts';
import HardwareProviderETH from './modules/HardwareProvider';
import ChainProviderETH from './modules/ChainProvider';
import HdKeyProviderETH from './modules/HdKeyProvider';

class WalletETH extends WalletBase {
  // TODO move to optionsDefault
  get hdCoin() {
    return CONST_CHAIN_KEYS.ETH;
  }

  get optionsDefault() {
    return {
      balanceDecimals: 18,
      // TODO template to m/44'/60'/0'/0/i
      hdPathTemplate: `m/44'/60'/0'/0/{{index}}`,
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

export default WalletETH;
