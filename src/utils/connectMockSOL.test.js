import connectMockSOL from './connectMockSOL';

describe('Common utils', function () {
  describe('camelCaseToCapitalize', function () {
    it('should return a capitalized string from a camel-cased string', function () {
      connectMockSOL.getAccountFromMnemonic({
        hdPath: "m/44'/501'/0",
      });
    });
  });
});
