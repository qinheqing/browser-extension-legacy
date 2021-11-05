import { useSelector } from 'react-redux';
import { NETWORK_TYPE_RPC } from '../../shared/constants/network';
import utilsApp from '../utils/utilsApp';
import storeChain from '../store/storeChain';
import evmChainsConfig from '../config/chains/EVM';
import useI18n from './useI18n';

function getEvmChainInfo(chain) {
  // eslint-disable-next-line no-param-reassign
  chain = (chain || '').toLowerCase();
  let chainInfo = evmChainsConfig.find((item) => item.chain === chain);
  chainInfo = chainInfo || { chain, chainName: chain, chainIcon: chain };
  const chainIcon = chainInfo?.chainIcon || chainInfo?.chain || chain;
  return {
    ...chainInfo,
    chainIcon,
  };
}

function useCurrentChainInfo() {
  const t = useI18n();
  const currentNetwork = useSelector((state) => ({
    nickname: state.metamask.provider.nickname,
    chainType: state.metamask.provider.type,
  }));
  const { nickname, chainType } = currentNetwork;
  if (utilsApp.isOldHome()) {
    const chainInfo = getEvmChainInfo(chainType);
    const name =
      chainType === NETWORK_TYPE_RPC
        ? nickname ?? t('privateNetwork')
        : t(chainType);
    return {
      ...chainInfo,
      name,
      shortname: chainType,
    };
  }
  return storeChain.currentChainInfo;
}

export default useCurrentChainInfo;
export { getEvmChainInfo };
