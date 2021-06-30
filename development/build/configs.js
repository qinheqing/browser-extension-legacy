const sassConfig = {
  includePaths: ['src'],

  // Enable both of these to get source maps working
  // "browserify --debug" will also enable css sourcemaps
  // sourceMapEmbed: true,
  // sourceMapContents: true,

  // This is the default only when opt.sass is undefined
  // outputStyle: 'compressed',
};

module.exports = {
  sassConfig,
};
