import { contractTokens } from '../tokens';

/**
 * A normalized list of addresses exported as part of the contractMap in
 * contract-metadata. Used primarily to validate if manually entered
 * contract addresses do not match one of our listed tokens
 */
export const LISTED_CONTRACT_ADDRESSES = contractTokens.eth.map((e) =>
  e.address.toLowerCase(),
);
