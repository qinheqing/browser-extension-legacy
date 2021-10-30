import { useSelector } from 'react-redux';
import { NETWORK_TYPE_RPC } from '../../shared/constants/network';
import utilsApp from '../utils/utilsApp';
import storeChain from '../store/storeChain';
import useI18n from './useI18n';

function useCurrentChainInfo() {
  const t = useI18n();
  const currentNetwork = useSelector((state) => ({
    nickname: state.metamask.provider.nickname,
    chainType: state.metamask.provider.type,
  }));
  const { nickname, chainType } = currentNetwork;
  if (utilsApp.isOldHome()) {
    const name =
      chainType === NETWORK_TYPE_RPC
        ? nickname ?? t('privateNetwork')
        : t(chainType);
    return {
      name,
      shortname: chainType,
    };
  }
  return storeChain.currentChainInfo;
}

export default useCurrentChainInfo;
