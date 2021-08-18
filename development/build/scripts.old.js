/* eslint-disable  node/global-require */
const path = require('path');
const childProcess = require('child_process');
const gulp = require('gulp');
const watch = require('gulp-watch');
const pify = require('pify');
const pump = pify(require('pump'));
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const log = require('fancy-log');
const { assign } = require('lodash');
const watchify = require('watchify');
const babelify = require('babelify');
const unflowify = require('unflowify');
const browserify = require('browserify');
const envify = require('loose-envify/custom');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser-js');
const cssModulesify = require('css-modulesify');
const scssify = require('scssify2');
const tsify = require('tsify');
const bifyModuleGroups = require('bify-module-groups');

const conf = require('rc')('metamask', {
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  SEGMENT_HOST: process.env.SEGMENT_HOST,
  SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
  SEGMENT_LEGACY_WRITE_KEY: process.env.SEGMENT_LEGACY_WRITE_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_DSN_DEV: process.env.SENTRY_DSN_DEV,
});

const baseManifest = require('../../app/manifest/_base.json');

const packageJSON = require('../../package.json');
const configs = require('./configs');
const {
  createTask,
  composeParallel,
  composeSeries,
  runInChildProcess,
} = require('./task');

module.exports = createScriptTasks;

const dependencies = Object.keys(
  (packageJSON && packageJSON.dependencies) || {},
);
const ignoreDeps = ['tailwindcss', 'readable-stream'];
const commonDeps = ['lodash'];
const materialUIDependencies = ['@material-ui/core'];
const metamaskDepenendencies = [
  'mobx',
  'ethjs',
  'ethjs-ens',
  'web3',
  'ethjs-contract',
  'eth-block-tracker',
  'eth-ens-namehash',
  'eth-json-rpc-filters',
  'eth-json-rpc-infura',
  'eth-json-rpc-middleware',
  'eth-keyring-controller',
  'eth-method-registry',
  'eth-phishing-detect',
  'eth-query',
  'eth-rpc-errors',
  'ethers',
  'json-rpc-engine',
  'json-rpc-middleware-stream',
  'ethereumjs-wallet',
  '@zxing/library',
  '@formatjs/intl-relativetimeformat',
  '@onekeyhq/eth-onekey-keyring',
  '@onekeyhq/jazzicon',
  '@onekeyhq/obs-store',
];
const reactDepenendencies = dependencies.filter((dep) => dep.match(/react/u));

const externalDependenciesMap = {
  background: filterAvailableDeps([...commonDeps]),
  ui: filterAvailableDeps([
    ...commonDeps,
    ...materialUIDependencies,
    ...reactDepenendencies,
    ...metamaskDepenendencies,
    // ...dependencies,
  ]),
};

// console.log('------ externalDependenciesMap -----');
// console.log(externalDependenciesMap);

function filterAvailableDeps(deps = []) {
  // return deps;
  return deps.filter(
    (item) => dependencies.includes(item) && !ignoreDeps.includes(item),
  );
}

function createScriptTasks({ browserPlatforms, livereload }) {
  // internal tasks
  const core = {
    // dev tasks (live reload)
    dev: createTasksForBuildJsExtension({
      taskPrefix: 'scripts:core:dev',
      devMode: true,
      // isExternalDeps: false,
      isExternalDeps: Boolean(process.env.ENV_DEV_BUILD_LIBS),
    }),
    testDev: createTasksForBuildJsExtension({
      taskPrefix: 'scripts:core:test-live',
      devMode: true,
      testing: true,
    }),
    // built for CI tests
    test: createTasksForBuildJsExtension({
      taskPrefix: 'scripts:core:test',
      testing: true,
    }),
    // production
    prod: createTasksForBuildJsExtension({ taskPrefix: 'scripts:core:prod' }),
  };
  const deps = createDepsTask({ devMode: false });
  const depsDev = createDepsTask({ devMode: true });

  // high level tasks

  const prod = composeParallel(deps.background, deps.ui, core.prod);

  /*
  should comment
     manifest.js#scriptsToExcludeFromBackgroundDevBuild
        'bg-libs.js': true,
  should set scripts:core:dev
     isExternalDeps: true;
  */
  const dev = process.env.ENV_DEV_BUILD_LIBS
    ? composeParallel(depsDev.background, depsDev.ui, core.dev)
    : core.dev;

  const { testDev } = core;

  const test = composeParallel(deps.background, deps.ui, core.test);

  return {
    prod,
    dev,
    testDev,
    test,
  };

  function createDepsTask({ devMode }) {
    const _deps = {
      background: createTasksForBuildJsDeps({
        filename: 'bg-libs',
        key: 'background',
        devMode,
      }),
      ui: createTasksForBuildJsDeps({
        filename: 'ui-libs',
        key: 'ui',
        devMode,
      }),
    };
    return _deps;
  }

  function createTasksForBuildJsDeps({ key, filename, devMode = false }) {
    return createTask(
      `scripts:deps:${key}${devMode ? ':DEV' : ''}`,
      bundleTask({
        label: filename,
        filename: `${filename}.js`,
        buildLib: true,
        dependenciesToBundle: externalDependenciesMap[key],
        devMode,
      }),
    );
  }

  function createTasksForBuildJsExtension({
    taskPrefix,
    devMode,
    testing,
    isExternalDeps,
  }) {
    const standardBundles = [
      'background',
      'ui',
      'phishing-detect',
      'initSentry', // sentry-install
    ];

    const standardSubtask = createTask(
      `${taskPrefix}:standardBundles`,
      createBundleTaskForBuildJsExtensionNormal({
        filename: standardBundles,
        devMode,
        testing,
        isExternalDeps,
      }),
    );

    const standardSubtasks = standardBundles.map((filename) =>
      createTask(
        `${taskPrefix}:${filename}`,
        createBundleTaskForBuildJsExtensionNormal({
          filename,
          devMode,
          testing,
          isExternalDeps,
        }),
      ),
    );

    // inpage must be built before contentscript
    // because inpage bundle result is included inside contentscript
    const contentscriptSubtask = createTask(
      `${taskPrefix}:contentscript`,
      createTaskForBuildJsExtensionContentscript({
        devMode,
        testing,
        isExternalDeps,
      }),
    );

    // this can run whenever
    const disableConsoleSubtask = createTask(
      `${taskPrefix}:disable-console`,
      createTaskForBuildJsExtensionDisableConsole({
        devMode,
        testing,
        isExternalDeps,
      }),
    );

    // task for initiating livereload
    const initiateLiveReload = async () => {
      if (devMode) {
        // trigger live reload when the bundles are updated
        // this is not ideal, but overcomes the limitations:
        // - run from the main process (not child process tasks)
        // - after the first build has completed (thus the timeout)
        // - build tasks never "complete" when run with livereload + child process
        setTimeout(() => {
          watch('./dist/*/*.js', (event) => {
            livereload.changed(event.path);
          });
        }, 75e3);
      }
    };

    // make each bundle run in a separate process
    const allSubtasks = [
      ...standardSubtasks,
      // standardSubtask,
      contentscriptSubtask,
      disableConsoleSubtask,
    ].map((subtask) => runInChildProcess(subtask));
    // const allSubtasks = [...standardSubtasks, contentscriptSubtask].map(subtask => (subtask))
    // make a parent task that runs each task in a child thread
    return composeParallel(initiateLiveReload, ...allSubtasks);
  }

  function getExternalDependencies(
    externalDependencies,
    { devMode, isExternalDeps, testing },
  ) {
    const _deps = isExternalDeps || !devMode ? externalDependencies : undefined;
    return _deps;
  }

  function createBundleTaskForBuildJsExtensionNormal({
    filename,
    devMode,
    testing,
    isExternalDeps,
  }) {
    return bundleTask({
      label: filename,
      filename: `${filename}.js`,
      filepath: `./app/scripts/${filename}.js`,
      externalDependencies: getExternalDependencies(
        externalDependenciesMap[filename],
        {
          devMode,
          testing,
          isExternalDeps,
        },
      ),
      devMode,
      testing,
    });
  }

  function createTaskForBuildJsExtensionDisableConsole({ devMode }) {
    const filename = 'disable-console';
    return bundleTask({
      label: filename,
      filename: `${filename}.js`,
      filepath: `./app/scripts/${filename}.js`,
      devMode,
    });
  }

  function createTaskForBuildJsExtensionContentscript({
    devMode,
    testing,
    isExternalDeps,
  }) {
    const inpage = 'inpage';
    const contentscript = 'contentscript';
    return composeSeries(
      bundleTask({
        label: inpage,
        filename: `${inpage}.js`,
        filepath: `./app/scripts/${inpage}.js`,
        externalDependencies: getExternalDependencies(
          externalDependenciesMap[inpage],
          {
            devMode,
            testing,
            isExternalDeps,
          },
        ),
        devMode,
        testing,
      }),
      bundleTask({
        label: contentscript,
        filename: `${contentscript}.js`,
        filepath: `./app/scripts/${contentscript}.js`,
        externalDependencies: getExternalDependencies(
          externalDependenciesMap[contentscript],
          {
            devMode,
            testing,
            isExternalDeps,
          },
        ),
        devMode,
        testing,
      }),
    );
  }

  function bundleTask(opts) {
    let bundler;

    return performBundle;

    async function performBundle() {
      // initialize bundler if not available yet
      // dont create bundler until task is actually run
      if (!bundler) {
        bundler = generateBundler(opts, performBundle);
        // output build logs to terminal
        bundler.on('log', log);
      }

      const buildPipeline = [
        bundler.bundle(),
        // convert bundle stream to gulp vinyl stream
        // source(opts.filename),
        source(opts.filename),

        // bifyModuleGroups.groupBySize({ sizeLimit: 2000 * 1000 }),

        // Initialize Source Maps
        buffer(),
        // loads map from browserify file
        sourcemaps.init({ loadMaps: true }),
      ];

      // Minification
      if (!opts.devMode) {
        buildPipeline.push(
          terser({
            mangle: {
              reserved: ['MetamaskInpageProvider'],
            },
            sourceMap: {
              content: true,
            },
          }),
        );
      }

      // Finalize Source Maps
      if (opts.devMode) {
        // Use inline source maps for development due to Chrome DevTools bug
        // https://bugs.chromium.org/p/chromium/issues/detail?id=931675
        // note: sourcemaps call arity is important

        // TODO inline source maps lowest speed
        // buildPipeline.push(sourcemaps.write()); // inline sourcemap

        // external file sourcemap not working in extension
        buildPipeline.push(
          sourcemaps.write('../sourcemaps', {
            sourceMappingURLPrefix: () => 'http://localhost:3131',
          }),
        );
      } else {
        buildPipeline.push(sourcemaps.write('../sourcemaps'));
      }

      // write completed bundles
      browserPlatforms.forEach((platform) => {
        const dest = `./dist/${platform}`;
        buildPipeline.push(gulp.dest(dest));
      });

      // process bundles
      if (opts.devMode) {
        try {
          await pump(buildPipeline);
        } catch (err) {
          gracefulError(err);
        }
      } else {
        await pump(buildPipeline);
      }
    }
  }

  function generateBundler(opts, performBundle) {
    const browserifyOpts = assign({}, watchify.args, {
      plugin: [],
      transform: [],
      debug: true,
      fullPaths: opts.devMode,
      paths: [
        path.resolve(__dirname, '../..'),
        path.resolve(__dirname, '../../src'),
      ],
    });

    if (!opts.buildLib) {
      if (opts.devMode && opts.filename === 'ui.js') {
        browserifyOpts.entries = [].concat(opts.filepath);
        // we can toggle react-devtools on or off by env
        if (process.env.ENV_REACT_DEVTOOLS_ON) {
          browserifyOpts.entries.unshift(
            './development/require-react-devtools.js',
          );
        }
      } else {
        browserifyOpts.entries = [].concat(opts.filepath);
      }
    }

    /*
    SyntaxError: 'import' and 'export' may appear only with 'sourceType: module' (1:0) while parsing /Users/zuozhuo/workspace/onekey-extension/node_modules/@solana/web3.js/lib/index.browser.esm.js
     */
    // https://stackoverflow.com/questions/40029113/syntaxerror-import-and-export-may-appear-only-with-sourcetype-module-g
    let bundler = browserify(browserifyOpts)
      // .transform(unflowify)
      .transform(babelify, {})

      // [scssify] is conflict by [cssModulesify], will finally output by [cssModulesify], use gulp instead.
      // .transform(scssify, configs.scssifyConfig)

      // .transform(
      //   babelify.configure({
      //     // presets: ['@babel/preset-env'],
      //     // ignore: [/\/node_modules\/(?!@solana\/web3\.js\/)/u],
      //     presets: ['es2015'],
      //   }),
      // )
      .transform('brfs');

    if (opts.buildLib) {
      bundler = bundler.require(opts.dependenciesToBundle);
    }

    if (opts.externalDependencies) {
      bundler = bundler.external(opts.externalDependencies);
    }

    const environment = getEnvironment({
      devMode: opts.devMode,
      test: opts.testing,
    });
    if (environment === 'production' && !process.env.SENTRY_DSN) {
      throw new Error('Missing SENTRY_DSN environment variable');
    }

    // Inject variables into bundle
    bundler.transform(
      envify({
        METAMASK_DEBUG: opts.devMode,
        METAMASK_ENVIRONMENT: environment,
        METAMASK_VERSION: baseManifest.version,
        NODE_ENV: opts.devMode ? 'development' : 'production',
        IN_TEST: opts.testing ? 'true' : false,
        PUBNUB_SUB_KEY: process.env.PUBNUB_SUB_KEY || '',
        PUBNUB_PUB_KEY: process.env.PUBNUB_PUB_KEY || '',
        CONF: opts.devMode ? conf : {},
        SENTRY_DSN: process.env.SENTRY_DSN || conf.SENTRY_DSN,
        SENTRY_DSN_DEV: process.env.SENTRY_DSN_DEV || conf.SENTRY_DSN_DEV,
        ENV_REDUX_DEVTOOLS_ON: process.env.ENV_REDUX_DEVTOOLS_ON,
        ENV_ON_BOARDING_START_CHOICE: process.env.ENV_ON_BOARDING_START_CHOICE,
        ENV_DEFAULT_PASSWORD_AUTO_FILLED:
          process.env.ENV_DEFAULT_PASSWORD_AUTO_FILLED || '',
        INFURA_PROJECT_ID: opts.testing
          ? '00000000000000000000000000000000'
          : conf.INFURA_PROJECT_ID,
        SEGMENT_HOST: conf.SEGMENT_HOST,
        // When we're in the 'production' environment we will use a specific key only set in CI
        // Otherwise we'll use the key from .metamaskrc or from the environment variable. If
        // the value of SEGMENT_WRITE_KEY that we envify is undefined then no events will be tracked
        // in the build. This is intentional so that developers can contribute to MetaMask without
        // inflating event volume.
        SEGMENT_WRITE_KEY:
          environment === 'production'
            ? process.env.SEGMENT_PROD_WRITE_KEY
            : conf.SEGMENT_WRITE_KEY,
        SEGMENT_LEGACY_WRITE_KEY:
          environment === 'production'
            ? process.env.SEGMENT_PROD_LEGACY_WRITE_KEY
            : conf.SEGMENT_LEGACY_WRITE_KEY,
      }),
      {
        global: true,
      },
    );

    // Live reload - minimal rebundle on change
    if (opts.devMode) {
      bundler = watchify(bundler);
      // on any file update, re-runs the bundler
      bundler.on('update', () => {
        console.log('watchify changed, restart performBundle');
        performBundle();
      });
    }

    if (opts.label === 'ui') {
      // some thing only build ui
      bundler.plugin(cssModulesify, {
        // eslint-disable-next-line no-useless-escape
        filePattern: '.css$',
        // rootDir: __dirname,
        before: [
          // require('postcss-import'),
          // require('tailwindcss')
        ],
        after: [
          // require('autoprefixer')
        ],
        output: 'src/styles/tailwind.module.css',
        generateScopedName: opts.devMode
          ? cssModulesify.generateLongName
          : cssModulesify.generateShortName,
      });
    }

    bundler.plugin(tsify, { noImplicitAny: true });
    // bundler.plugin(bifyModuleGroups.plugin);

    return bundler;
  }
}

function getEnvironment({ devMode, test }) {
  // get environment slug
  if (devMode) {
    return 'development';
  }

  if (test) {
    return 'testing';
  }

  if (process.env.CIRCLE_BRANCH === 'master') {
    return 'production';
  }

  if (/^Version-v(\d+)[.](\d+)[.](\d+)/u.test(process.env.CIRCLE_BRANCH)) {
    return 'release-candidate';
  }

  if (process.env.CIRCLE_BRANCH === 'develop') {
    return 'staging';
  }

  if (process.env.CIRCLE_PULL_REQUEST) {
    return 'pull-request';
  }
  return 'other';
}

function beep() {
  process.stdout.write('\x07');
}

function gracefulError(err) {
  console.warn(err);
  beep();
}
