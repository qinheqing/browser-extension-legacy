import BigNumber from 'bignumber.js';
import { shuffle } from 'lodash';
import contractMap from '@onekeyhq/contract-metadata';
import { checksumAddress } from '../helpers/utils/util';
import { getTokenFiatAmount } from '../helpers/utils/token-util';

const tokenList = shuffle(
  Object.entries(contractMap)
    .map(([address, tokenData]) => ({
      ...tokenData,
      address: address.toLowerCase(),
    }))
    .filter((tokenData) => Boolean(tokenData.erc20)),
);

export function getRenderableTokenData(
  token,
  contractExchangeRates,
  conversionRate,
  currentCurrency,
) {
  const { symbol, name, address, iconUrl, string, balance, decimals } = token;

  const formattedFiat =
    getTokenFiatAmount(
      symbol === 'ETH' ? 1 : contractExchangeRates[address],
      conversionRate,
      currentCurrency,
      string,
      symbol,
      true,
    ) || '';
  const rawFiat =
    getTokenFiatAmount(
      symbol === 'ETH' ? 1 : contractExchangeRates[address],
      conversionRate,
      currentCurrency,
      string,
      symbol,
      false,
    ) || '';
  const usedIconUrl =
    iconUrl ||
    (contractMap[checksumAddress(address)] &&
      `images/contract/${contractMap[checksumAddress(address)].logo}`);
  return {
    ...token,
    primaryLabel: symbol,
    secondaryLabel: name || contractMap[checksumAddress(address)]?.name,
    rightPrimaryLabel:
      string && `${new BigNumber(string).round(6).toString()} ${symbol}`,
    rightSecondaryLabel: formattedFiat,
    iconUrl: usedIconUrl,
    identiconAddress: usedIconUrl ? null : address,
    balance,
    decimals,
    name: name || contractMap[checksumAddress(address)]?.name,
    rawFiat,
  };
}
