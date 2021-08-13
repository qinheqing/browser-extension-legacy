const sass = require('sass');

module.exports = {
  render: (opts, callback) => {
    // sass wants its arguments to come from the same Realm as itself
    // bridgeJson and bridgeFn are added via patch-package to make this possible
    //    sass.bridgeJson is not a function
    if (!sass.bridgeJson) {
      throw new Error(
        'It seems node modules not installed correctly, please re-run [ yarn setup ]',
      );
    }
    sass.render(sass.bridgeJson(opts), sass.bridgeFn(callback));
  },
  renderSync: () => {
    throw new Error('sass-wrapper - renderSync not supported');
  },
};
