import HecoTokensList from './heco.json';
import BscTokensList from './bsc.json';
import EthTokensList from './eth.json';
import KovanTokensList from './kovan.json';
import MaticTokenList from './matic.json';

function toMap(tokens) {
  return tokens.reduce(function (result, item) {
    result[item.address] = item;
    return result;
  }, {});
}

export const contractTokens = {
  heco: HecoTokensList.tokens,
  bsc: BscTokensList.tokens,
  eth: EthTokensList.tokens,
  mainnet: EthTokensList.tokens,
  kovan: KovanTokensList.tokens,
  matic: MaticTokenList.tokens,
};

export const contractMap = {
  heco: toMap(HecoTokensList.tokens),
  bsc: toMap(BscTokensList.tokens),
  eth: toMap(EthTokensList.tokens),
  mainnet: toMap(EthTokensList.tokens),
  kovan: toMap(KovanTokensList.tokens),
  matic: toMap(MaticTokenList.tokens),
};
