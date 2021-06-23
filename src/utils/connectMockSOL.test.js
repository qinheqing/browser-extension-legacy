import connectMockSOL from './connectMockSOL';

// TODO as solanaWeb3 is defined by window, not compatible with unittest
describe('Common utils', function () {
  describe('camelCaseToCapitalize', function () {
    it('should return a capitalized string from a camel-cased string', function () {
      connectMockSOL.getAccountFromMnemonic({
        hdPath: "m/44'/501'/0",
      });
    });
  });
});
