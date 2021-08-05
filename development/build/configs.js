const path = require('path');

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

const browserifyPaths = [
  path.resolve(__dirname, '../..'),
  path.resolve(__dirname, '../../src'),
];

const browserifyAlias = {
  aliases: {
    lodash000: './shims/d3.js',
  },
  verbose: true,
};

/*
  1. copyFiles
  2. htmlInjectJs
  3. globalShim
  4. package.json #browser filed

  // https://github.com/browserify/browserify#browser-field
 */
const externalModulesCopyFiles = [
  {
    // why use global mobx?
    //    bify cause mobx error:
    //        Uncaught TypeError: Cannot assign to read only property 'concat' of object '[object Object]'
    src: `./node_modules/mobx/dist/mobx.umd.production.min.js`,
    dest: `vendor/external-js/mobx.js`,
  },
  {
    /*
    Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' blob: filesystem:".

     use patch-package remove 'use strict';
     */
    src: `./node_modules/@solana/web3.js/lib/index.iife.js`,
    dest: `vendor/external-js/solana-web3.js`,
  },
];

const externalModulesHtmlInjectJs = [
  // 'external-libs',
  // ----------------------------------------------
  'vendor/external-js/mobx',
  'vendor/external-js/solana-web3',
];

const externalModulesGlobalShim = {
  //  import mobx from 'mobx';
  //      ->  const mobx = window.mobx;
  'mobx': 'mobx',
  //  import solanaWeb3 from '@solana/web3.js';
  //      ->  const solanaWeb3 = window.solanaWeb3;
  '@solana/web3.js': 'solanaWeb3',
};

// THIS IS NOT WORKING
//    please update:   package.json #browser field
const externalModulesBrowserField = {
  // mobx-react-lite should be out of node_modules folder,
  //    so that the deps "mobx" can be resolved as global var.
  'mobx-react-lite': './app/vendor/mobx-react-lite.js',
};

module.exports = {
  sassConfig,
  scssifyConfig,
  browserifyPaths,
  browserifyAlias,
  externalModulesCopyFiles,
  externalModulesHtmlInjectJs,
  externalModulesGlobalShim,
  externalModulesBrowserField,
};
