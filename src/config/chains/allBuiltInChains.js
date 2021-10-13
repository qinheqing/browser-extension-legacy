// TODO use https://github.com/OneKeyHQ/remote-config
import OneChainInfo from '../../classes/OneChainInfo';
import chains from '.';

function createBuiltInChains() {
  const chainsRaw = chains;
  return chainsRaw.reduce((prev, current) => {
    const info = new OneChainInfo(current);
    prev[info.key] = info;
    return prev;
  }, {});
}

// { SOL: chainInfo, SOL_T: chainInfo }
const allBuiltInChainsMap = createBuiltInChains();
// [ {baseChain}, {baseChain} ]
const allBuiltInChains = Object.values(allBuiltInChainsMap);

export { allBuiltInChainsMap, allBuiltInChains };
