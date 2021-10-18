// TODO: THIS IS NOT WORKING (module should outside of node_modules, but can not global shim)
//    please update at:   package.json > browser field
const externalModulesBrowserField = {
  // mobx-react-lite should be out of node_modules folder,
  //    so that the deps "mobx" can be resolved as global var.
  'mobx-react-lite': './app/vendor/mobx-react-lite.js',
  // TODO auto update package.json
};

const externalModulesConfig = [
  {
    // externalModulesGlobalShim
    npm: 'mobx',
    global: 'mobx',

    // externalModulesCopyFiles
    // externalModulesHtmlInjectJs
    src: `./node_modules/mobx/dist/mobx.umd.production.min.js`, // empty not copy
    dest: `vendor/external-js/mobx.js`, // copy dest, html inject js

    // externalSourcemapsCopyFiles
    sourcemap: {
      // copy sourcemaps
      // # sourceMappingURL=http://localhost:31317/sourcemaps/ui.js.map
      src: `./app/vendor/js-conflux-sdk/1.7.0/js-conflux-sdk.umd.min.js.map`,
      dest: `../sourcemaps/js-conflux-sdk.umd.min.js.map`,
    },
  },
];

const externalModules = {};

module.exports = externalModules;
