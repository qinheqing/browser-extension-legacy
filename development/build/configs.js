const sassConfig = {
  includePaths: ['src', 'ui'],

  // Enable both of these to get source maps working
  // "browserify --debug" will also enable css sourcemaps
  // sourceMapEmbed: true,
  // sourceMapContents: true,

  // This is the default only when opt.sass is undefined
  // outputStyle: 'compressed',
};

const scssifyConfig = {
  autoInject: {
    // Useful for debugging; adds data-href="src/foo.scss" to <style> tags
    verbose: true,
    // If true the <style> tag will be prepended to the <head>
    prepend: false,
  },

  // require('./MyComponent.scss') === '.MyComponent{color:red;background:blue}'
  // autoInject: false, will also enable this
  // pre 1.x.x, this is enabled by default
  export: false,

  // Pass options to the compiler, check the node-sass project for more details
  sass: {
    sourceMapEmbed: false,
    sourceMapContents: false,
    // This is the default only when opt.sass is undefined
    outputStyle: 'compressed',
    ...sassConfig,
  },

  // Configure postcss plugins too!
  // postcss is a "soft" dependency so you may need to install it yourself
  postcss: {
    autoprefixer: {},
  },

  postProcess(css) {
    // allows for processing the generated CSS
    return css;
  },
};

module.exports = {
  sassConfig,
  scssifyConfig,
};
