// https://github.com/solana-labs/token-list/blob/main/src/tokens/solana.tokenlist.json
export default {
  name: '',
  icon: '',
  decimals: 9, // decimals when the balance value is an integer. ( e.g., 38267763 = 0.038267763 SOL )
  precision: 18, // display precision. ( e.g., 0.3726553 = 0.3727 )
  isNative: false, // isNativeToken like: BNB、ETH、SOL
  balance: 0, //
  address: '', // token address
  depositAddress: '', // token deposit address
  accountAddress: '', // account address to which token belongs
  contractAddress: '0x11111', // token contract address, mintAddress in SOL
  associateAddress: '',
};
