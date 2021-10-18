import { CFX, CFX_TEST } from '../../wallets/providers/CFX/config/chain';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../../ui/app/helpers/constants/common';
import { SOL, SOL_TEST } from './SOL';
import { BTC, BSC, BSC_TEST } from './MISC';

// eslint-disable-next-line import/no-mutable-exports
let chainsEnabled = [SOL, CFX];

if (IS_ENV_IN_TEST_OR_DEBUG) {
  chainsEnabled = [...chainsEnabled, SOL_TEST, CFX_TEST];
}
export default chainsEnabled;
