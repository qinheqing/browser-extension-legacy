/* eslint-disable node/no-extraneous-require,import/no-extraneous-dependencies */
const { callbackify } = require('util');
const path = require('path');
const { writeFileSync, readFileSync } = require('fs');
const EventEmitter = require('events');
const assert = require('assert');
const gulp = require('gulp');
const watch = require('gulp-watch');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const log = require('fancy-log');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const aliasify = require('aliasify');
const browserifyShim = require('browserify-shim');
const brfs = require('brfs');
const envify = require('loose-envify/custom');
const sourcemaps = require('gulp-sourcemaps');
const applySourceMap = require('vinyl-sourcemaps-apply');
const pify = require('pify');
const through = require('through2');
const endOfStream = pify(require('end-of-stream'));
const labeledStreamSplicer = require('labeled-stream-splicer').obj;
const wrapInStream = require('pumpify').obj;
const Sqrl = require('squirrelly');
const lavaPack = require('@lavamoat/lavapack');
const terser = require('terser');
const cssModulesify = require('css-modulesify');
const browserPack = require('browser-pack');
const pump = require('pump');
const vfs = require('vinyl-fs');

// https://github.com/browserify/browserify#browserifyfiles--opts

// TODO tree shaking
//      https://github.com/browserify/common-shakeify

const bifyModuleGroups = require('bify-module-groups');

const metamaskrc = require('rc')('metamask', {
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  SEGMENT_HOST: process.env.SEGMENT_HOST,
  SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
  SEGMENT_LEGACY_WRITE_KEY: process.env.SEGMENT_LEGACY_WRITE_KEY,
  SENTRY_DSN_DEV:
    process.env.SENTRY_DSN_DEV ||
    'https://f59f3dd640d2429d9d0e2445a87ea8e1@sentry.io/273496',
});
const { version } = require('../../package.json');
const { streamFlatMap } = require('../stream-flat-map');
const baseManifest = require('../../app/manifest/_base.json');
const buildUtils = require('./buildUtils');
const externalLibs = require('./externalLibs');
const {
  createTask,
  composeParallel,
  composeSeries,
  runInChildProcess,
} = require('./task');
const configs = require('./configs');

module.exports = createScriptTasks;

const { IS_LEGACY_BUILD } = configs;

const noop = () => {
  // console
};

function createForEachStream({ onEach = noop, onEnd = noop }) {
  return through(
    (entry, _, cb) => {
      onEach(entry);
      cb();
    },
    (cb) => {
      onEnd();
      cb();
    },
  );
}

function createScriptTasks({ browserPlatforms, livereload }) {
  // internal tasks
  const core = {
    // dev tasks (live reload)
    dev: createTasksForBuildJsExtension({
      taskPrefix: 'scripts:core:dev',
      devMode: true,
      browserPlatforms,
      livereload,
    }),
    testDev: createTasksForBuildJsExtension({
      taskPrefix: 'scripts:core:test-live',
      devMode: true,
      testing: true,
      browserPlatforms,
      livereload,
    }),
    // built for CI tests
    test: createTasksForBuildJsExtension({
      taskPrefix: 'scripts:core:test',
      testing: true,
      browserPlatforms,
      livereload,
    }),
    // production
    prod: createTasksForBuildJsExtension({
      taskPrefix: 'scripts:core:prod',
      browserPlatforms,
      livereload,
    }),
  };

  // high level tasks

  const { dev, test, testDev, prod } = core;
  return { dev, test, testDev, prod };
}

function createTasksForBuildJsExtension({
  taskPrefix,
  devMode,
  testing,
  browserPlatforms,
  livereload,
}) {
  const standardEntryPoints = ['background', 'ui', 'phishing-detect'];
  const standardSubtask = createTask(
    `${taskPrefix}:standardEntryPoints`,
    createFactoredBuild({
      standardEntryPoints,
      entryFiles: standardEntryPoints.map(
        (label) => `./app/scripts/${label}.js`,
      ),
      devMode,
      testing,
      browserPlatforms,
    }),
  );

  // inpage must be built before contentscript
  // because inpage bundle result is included inside contentscript
  const contentscriptSubtask = createTask(
    `${taskPrefix}:contentscript`,
    createTaskForBundleContentscript({ devMode, testing, browserPlatforms }),
  );

  const externalLibsSubtask = createTask(
    `${taskPrefix}:external-libs`,
    createTaskForDepsLibs({
      filename: 'external-libs',
      devMode,
      browserPlatforms,
    }),
  );

  // this can run whenever
  const disableConsoleSubtask = createTask(
    `${taskPrefix}:disable-console`,
    createTaskForBundleDisableConsole({ devMode, browserPlatforms }),
  );

  // this can run whenever
  const installSentrySubtask = createTask(
    `${taskPrefix}:sentry`,
    createTaskForBundleSentry({ devMode, browserPlatforms }),
  );

  // task for initiating browser livereload
  const initiateLiveReload = async () => {
    if (devMode) {
      // trigger live reload when the bundles are updated
      // this is not ideal, but overcomes the limitations:
      // - run from the main process (not child process tasks)
      // - after the first build has completed (thus the timeout)
      // - build tasks never "complete" when run with livereload + child process
      setTimeout(() => {
        watch('./dist/*/*.js', (event) => {
          console.log(`[scripts] gulp-watch file changed: ${event.path}`);
          livereload.changed(event.path);
        });
      }, 75e3);
    }
  };

  // make each bundle run in a separate process
  const allSubtasks = [
    IS_LEGACY_BUILD && externalLibsSubtask,
    standardSubtask,
    contentscriptSubtask,
    disableConsoleSubtask,
    installSentrySubtask,
  ]
    .filter(Boolean)
    .map((subtask) => runInChildProcess(subtask));
  // make a parent task that runs each task in a child thread
  return composeParallel(initiateLiveReload, ...allSubtasks);
}

function createTaskForDepsLibs({ filename, devMode, browserPlatforms }) {
  const label = filename;
  return createNormalBundle({
    label,
    destFilepath: `${label}.js`,
    modulesToExpose: externalLibs,
    devMode,
    browserPlatforms,
  });
}

function createTaskForBundleDisableConsole({ devMode, browserPlatforms }) {
  const label = 'disable-console';
  return createNormalBundle({
    label,
    entryFilepath: `./app/scripts/${label}.js`,
    destFilepath: `${label}.js`,
    devMode,
    browserPlatforms,
  });
}

function createTaskForBundleSentry({ devMode, browserPlatforms }) {
  const label = 'sentry-install'; // initSentry.js => sentry-install.js
  return createNormalBundle({
    label,
    entryFilepath: `./app/scripts/${label}.js`,
    destFilepath: `${label}.js`,
    devMode,
    browserPlatforms,
  });
}

// the "contentscript" bundle contains the "inpage" bundle
function createTaskForBundleContentscript({
  devMode,
  testing,
  browserPlatforms,
}) {
  const inpage = 'inpage';
  const contentscript = 'contentscript';
  return composeSeries(
    createNormalBundle({
      label: inpage,
      entryFilepath: `./app/scripts/${inpage}.js`,
      destFilepath: `${inpage}.js`,
      devMode,
      testing,
      browserPlatforms,
    }),
    createNormalBundle({
      label: contentscript,
      entryFilepath: `./app/scripts/${contentscript}.js`,
      destFilepath: `${contentscript}.js`,
      devMode,
      testing,
      browserPlatforms,
    }),
  );
}

function createCssModulePlugin({ devMode }) {
  return [
    cssModulesify,
    {
      // eslint-disable-next-line no-useless-escape
      filePattern: `\.css$`,
      // rootDir: __dirname,
      before: [
        // require('postcss-import'),
        // require('tailwindcss')
      ],
      after: [
        // require('autoprefixer')
      ],
      output: 'src/styles/tailwind.module.css',
      generateScopedName: devMode
        ? cssModulesify.generateLongName
        : cssModulesify.generateShortName,
    },
  ];
}

function pipeLavaPackWrappedStream({ pipeline }) {
  const flatStream = streamFlatMap((moduleGroup) => {
    const filename = `${moduleGroup.label}.js`;
    const childStream = wrapInStream(
      moduleGroup.stream,
      lavaPack({
        raw: true,
        hasExports: true,
        includePrelude: false,
        prunePolicy: true,
        // standalone: 'Abc',
        // standaloneModule: 'Abc',
      }),
      source(filename),
    );
    return childStream; // lavaPack wrapped stream

    // const childStreamNormal = wrapInStream(
    //   moduleGroup.stream,
    //   browserPack({
    //     raw: true,
    //     hasExports: true,
    //     // includePrelude: false,
    //     // prunePolicy: true,
    //     // standalone: 'Abc',
    //     // standaloneModule: 'Abc',
    //   }),
    //   source(filename),
    // );
    // return childStreamNormal;
  });
  const normalStream = createForEachStream({
    onEach: (moduleGroup) => {
      pump(
        moduleGroup.stream,
        browserPack({ raw: true }),
        vfs.dest(`${moduleGroup.label}.js`),
      );
    },
  });
  pipeline.get('vinyl').unshift(
    // convert each module group into a stream with a single vinyl file
    flatStream,
    // normalStream,
    buffer(),
  );
}

function createFactoredBuild({
  standardEntryPoints,
  entryFiles,
  devMode,
  testing,
  browserPlatforms,
}) {
  if (IS_LEGACY_BUILD) {
    const normalBundles = standardEntryPoints.map((label) => {
      return createNormalBundle({
        label,
        entryFilepath: `./app/scripts/${label}.js`,
        destFilepath: `${label}.js`,
        externalLibsModules: externalLibs,
        devMode,
        testing,
        browserPlatforms,
      });
    });
    return composeSeries(...normalBundles);
  }

  return async function () {
    // create bundler setup and apply defaults
    const buildConfiguration = createBuildConfiguration();
    buildConfiguration.label = 'primary';
    const { bundlerOpts, events } = buildConfiguration;

    // devMode options
    const reloadOnChange = Boolean(devMode);
    const minify = Boolean(devMode) === false;

    const envVars = getEnvironmentVariables({ devMode, testing });
    setupBundlerDefaults(buildConfiguration, {
      devMode,
      envVars,
      reloadOnChange,
      minify,
    });

    // set bundle entries
    bundlerOpts.entries = [...entryFiles];

    // setup bundle factoring with bify-module-groups plugin
    Object.assign(bundlerOpts, bifyModuleGroups.plugin.args);
    bundlerOpts.plugin = [
      ...bundlerOpts.plugin,
      [bifyModuleGroups.plugin],
      // should after bify plugin
      //    TypeError: Invalid non-string/buffer chunk
      createCssModulePlugin({ devMode }),
    ];

    // set libs as external ( external-libs.js )
    //    not working: Object.values(moduleData.deps).filter(Boolean).forEach(nextId => {
    //    TypeError: Cannot read property 'deps' of undefined
    const setExternalLibs = () => {
      bundlerOpts.manualExternal = [
        ...bundlerOpts.manualExternal,
        ...externalLibs,
      ];
      bundlerOpts.manualExclude = [
        ...bundlerOpts.manualExclude,
        ...externalLibs,
      ];
    };
    // setExternalLibs();

    // instrument pipeline
    let sizeGroupMap;
    events.on('configurePipeline', ({ pipeline }) => {
      // to be populated by the group-by-size transform
      sizeGroupMap = new Map();
      pipeline.get('groups').unshift(
        // factor modules
        bifyModuleGroups.groupByFactor({
          entryFileToLabel(filepath) {
            return path.parse(filepath).name;
          },
        }),
        // cap files at 2 mb
        bifyModuleGroups.groupBySize({
          sizeLimit: 2e6,
          groupingMap: sizeGroupMap,
        }),

        // handle each module group
        // createForEachStream({
        //   onEach: (moduleGroup) => {
        //     pump(
        //       moduleGroup.stream,
        //       browserPack({ raw: true }),
        //       vfs.dest(`./bundles/${moduleGroup.label}.js`),
        //     );
        //   },
        // }),
      );

      pipeLavaPackWrappedStream({ pipeline });
      // pipeline.get('vinyl').unshift(buffer());

      // setup bundle destination
      browserPlatforms.forEach((platform) => {
        const dest = `./dist/${platform}/`;
        pipeline.get('dest').push(gulp.dest(dest));
      });
    });

    // wait for bundle completion for postprocessing
    events.on('bundleDone', () => {
      const commonSet = sizeGroupMap.get('common');
      // create entry points for each file
      for (const [groupLabel, groupSet] of sizeGroupMap.entries()) {
        // skip "common" group, they are added tp all other groups
        if (groupSet === commonSet) {
          continue;
        }

        buildAllHtmlFiles({
          groupLabel,
          groupSet,
          commonSet,
          browserPlatforms,
        });
      }
    });

    // console.log('buildConfiguration', buildConfiguration);

    await bundleIt(buildConfiguration);
  };
}

function createNormalBundle({
  label,
  destFilepath,
  entryFilepath,
  extraEntries = [],
  modulesToExpose, // buildLib, dependenciesToBundle
  externalLibsModules = [],
  devMode,
  testing,
  browserPlatforms,
}) {
  return async function () {
    // create bundler setup and apply defaults
    const buildConfiguration = createBuildConfiguration();
    buildConfiguration.label = label;
    const { bundlerOpts, events } = buildConfiguration;

    // devMode options
    const reloadOnChange = Boolean(devMode);
    const minify = Boolean(devMode) === false;

    const envVars = getEnvironmentVariables({ devMode, testing });
    setupBundlerDefaults(buildConfiguration, {
      devMode,
      envVars,
      reloadOnChange,
      minify,
    });

    // set bundle entries
    bundlerOpts.entries = [...extraEntries];
    if (entryFilepath) {
      bundlerOpts.entries.push(entryFilepath);
    }

    if (modulesToExpose) {
      bundlerOpts.require = bundlerOpts.require.concat(modulesToExpose);
    }

    if (externalLibsModules) {
      bundlerOpts.manualExternal = [
        ...bundlerOpts.manualExternal,
        ...externalLibsModules,
      ];
    }

    bundlerOpts.plugin = [
      ...bundlerOpts.plugin,
      // only build css-module in ui task, avoid rewriting of output files
      label === 'ui' && createCssModulePlugin({ devMode }),
    ].filter(Boolean);

    // instrument pipeline
    events.on('configurePipeline', ({ pipeline }) => {
      // convert bundle stream to gulp vinyl stream
      // and ensure file contents are buffered
      assert(destFilepath, 'createNormalBundle => destFilepath is required.');
      pipeline.get('vinyl').push(source(destFilepath));
      pipeline.get('vinyl').push(buffer());
      // setup bundle destination
      browserPlatforms.forEach((platform) => {
        const dest = `./dist/${platform}/`;
        pipeline.get('dest').push(gulp.dest(dest));
      });
    });

    events.on('bundleDone', () => {
      buildAllHtmlFiles({
        groupLabel: label,
        groupSet: new Set([label]),
        commonSet: new Set(),
        browserPlatforms,
        failOnUnknownLabel: false,
      });
    });

    await bundleIt(buildConfiguration);
  };
}

function createBuildConfiguration() {
  const label = '(unnamed bundle)';
  const events = new EventEmitter();
  const bundlerOpts = {
    entries: [],
    transform: [],
    plugin: [],
    require: [],
    // non-standard bify options
    manualExternal: [],
    manualIgnore: [],
    manualExclude: [],
  };
  return { label, bundlerOpts, events };
}

function setupBundlerDefaults(
  buildConfiguration,
  { devMode, envVars, reloadOnChange, minify },
) {
  const { bundlerOpts } = buildConfiguration;

  // eslint-disable-next-line node/global-require
  const globalShim = require('browserify-global-shim').configure(
    configs.externalModulesGlobalShim,
  );

  Object.assign(bundlerOpts, {
    require: [],
    // source transforms
    transform: [
      // [aliasify, configs.browserifyAlias],
      // browserifyShim,
      // "browserify-shim",
      // transpile top-level code
      babelify,
      // should after babelify
      //      SyntaxError: 'import' and 'export' may appear only with 'sourceType: module'
      globalShim,
      // inline `fs.readFileSync` files
      brfs,
    ].filter(Boolean),
    // use entryFilepath for moduleIds, easier to determine origin file
    fullPaths: devMode,
    paths: configs.browserifyPaths,
    // for sourcemaps
    debug: true,
  });

  // ensure react-devtools are not included in non-dev builds
  if (!devMode || !process.env.ENV_REACT_DEVTOOLS_ON) {
    // if react-devtools enabled, please start devtools server:
    //    ERROR: WebSocket connection to 'ws://localhost:8097/' failed
    //        1. process.env.ENV_REACT_DEVTOOLS_ON = true
    //        2. yarn devtools:react
    bundlerOpts.manualIgnore.push('react-devtools');
  }

  // inject environment variables via node-style `process.env`
  if (envVars) {
    bundlerOpts.transform.push([envify(envVars), { global: true }]);
  }

  // setup reload on change
  if (reloadOnChange) {
    setupReloadOnChange(buildConfiguration);
  }

  if (minify) {
    setupMinification(buildConfiguration);
  }

  // setup source maps
  setupSourcemaps(buildConfiguration, { devMode });
}

function setupReloadOnChange({ bundlerOpts, events }) {
  // add plugin to options
  Object.assign(bundlerOpts, {
    plugin: [...bundlerOpts.plugin, watchify],
    // required by watchify
    cache: {},
    packageCache: {},
  });
  // instrument pipeline
  events.on('configurePipeline', ({ bundleStream }) => {
    // handle build error to avoid breaking build process
    // (eg on syntax error)
    bundleStream.on('error', (err) => {
      gracefulError(err);
    });
  });
}

function setupMinification(buildConfiguration) {
  const minifyOpts = {
    format: {
      comments: false, // some, all, false, Regex
    },
    mangle: {
      // https://github.com/terser/terser#cli-mangle-options
      reserved: ['MetamaskInpageProvider'],
    },
  };
  const { events } = buildConfiguration;
  events.on('configurePipeline', ({ pipeline }) => {
    pipeline.get('minify').push(
      // this is the "gulp-terser-js" wrapper around the latest version of terser
      through.obj(
        callbackify(async (file, _enc) => {
          const input = {
            [file.sourceMap.file]: file.contents.toString(),
          };
          const opts = {
            sourceMap: {
              filename: file.sourceMap.file,
              content: file.sourceMap,
            },
            ...minifyOpts,
          };
          const res = await terser.minify(input, opts);
          file.contents = Buffer.from(res.code);
          applySourceMap(file, res.map);
          return file;
        }),
      ),
    );
  });
}

function setupSourcemaps(buildConfiguration, { devMode }) {
  const { events } = buildConfiguration;

  // factoredBuild support inline sourcemaps only
  let writeSourceMapDev = () => sourcemaps.write();

  if (IS_LEGACY_BUILD) {
    writeSourceMapDev = () =>
      sourcemaps.write('../sourcemaps', {
        // add sourceMappingURL comment to the end
        //      # sourceMappingURL=http://localhost:31317/sourcemaps/ui.js.map
        addComment: true,
        sourceMappingURLPrefix: () => 'http://localhost:31317',
      });
    // writeSourceMapDev = () => sourcemaps.write();
  }
  events.on('configurePipeline', ({ pipeline }) => {
    pipeline.get('sourcemaps:init').push(sourcemaps.init({ loadMaps: true }));
    pipeline
      .get('sourcemaps:write')
      // Use inline source maps for development due to Chrome DevTools bug
      // https://bugs.chromium.org/p/chromium/issues/detail?id=931675
      .push(
        devMode
          ? writeSourceMapDev()
          : sourcemaps.write('../sourcemaps', { addComment: true }),
      );
  });
}

async function bundleIt(buildConfiguration) {
  const { label, bundlerOpts, events } = buildConfiguration;
  const bundler = browserify(bundlerOpts);
  // manually apply non-standard options

  // bundler.require('abcde');
  bundler.external(bundlerOpts.manualExternal);
  // --ignore, -i  Replace a file with an empty stub. Files can be globs.
  bundler.ignore(bundlerOpts.manualIgnore);
  // --exclude, -u  Omit a file from the output bundle. Files can be globs.
  bundler.exclude(bundlerOpts.manualExclude);

  // output build logs to terminal
  bundler.on('log', log);
  // forward update event (used by watchify)
  bundler.on('update', () => {
    console.log('[scripts] watchify changed, restart performBundle()');
    performBundle();
  });

  console.log(`bundle start: "${label}"`);
  await performBundle();
  console.log(`bundle end: "${label}"`);

  async function performBundle() {
    // this pipeline is created for every bundle
    // the labels are all the steps you can hook into
    const pipeline = labeledStreamSplicer([
      'groups',
      [],
      'vinyl',
      [],
      'sourcemaps:init',
      [],
      'minify',
      [],
      'sourcemaps:write',
      [],
      'dest',
      [],
    ]);
    const bundleStream = bundler.bundle();
    // trigger build pipeline instrumentations
    events.emit('configurePipeline', { pipeline, bundleStream });
    // start bundle, send into pipeline
    bundleStream.pipe(pipeline);
    // nothing will consume pipeline, so let it flow
    pipeline.resume();

    await endOfStream(pipeline);

    // call the completion event to handle any post-processing
    events.emit('bundleDone');
  }
}

function getEnvironmentVariables({ devMode, testing }) {
  const environment = getEnvironment({ devMode, testing });
  if (environment === 'production' && !process.env.SENTRY_DSN) {
    throw new Error('Missing SENTRY_DSN environment variable');
  }
  return {
    METAMASK_DEBUG: devMode,
    METAMASK_ENVIRONMENT: environment,
    METAMASK_VERSION: version,
    NODE_ENV: devMode ? 'development' : 'production',
    IN_TEST: testing ? 'true' : false,
    PUBNUB_SUB_KEY: process.env.PUBNUB_SUB_KEY || '',
    PUBNUB_PUB_KEY: process.env.PUBNUB_PUB_KEY || '',
    CONF: devMode ? metamaskrc : {},
    SENTRY_DSN: process.env.SENTRY_DSN || metamaskrc.SENTRY_DSN,
    SENTRY_DSN_DEV: process.env.SENTRY_DSN_DEV || metamaskrc.SENTRY_DSN_DEV,
    INFURA_PROJECT_ID: testing
      ? '00000000000000000000000000000000'
      : metamaskrc.INFURA_PROJECT_ID,
    SEGMENT_HOST: metamaskrc.SEGMENT_HOST,
    // When we're in the 'production' environment we will use a specific key only set in CI
    // Otherwise we'll use the key from .metamaskrc or from the environment variable. If
    // the value of SEGMENT_WRITE_KEY that we envify is undefined then no events will be tracked
    // in the build. This is intentional so that developers can contribute to MetaMask without
    // inflating event volume.
    SEGMENT_WRITE_KEY:
      environment === 'production'
        ? process.env.SEGMENT_PROD_WRITE_KEY
        : metamaskrc.SEGMENT_WRITE_KEY,
    SEGMENT_LEGACY_WRITE_KEY:
      environment === 'production'
        ? process.env.SEGMENT_PROD_LEGACY_WRITE_KEY
        : metamaskrc.SEGMENT_LEGACY_WRITE_KEY,

    ENV_REDUX_DEVTOOLS_ON: process.env.ENV_REDUX_DEVTOOLS_ON,
    ENV_ON_BOARDING_START_CHOICE: process.env.ENV_ON_BOARDING_START_CHOICE,
    ENV_DEFAULT_PASSWORD_AUTO_FILLED:
      process.env.ENV_DEFAULT_PASSWORD_AUTO_FILLED || '',
  };
}

function getEnvironment({ devMode, testing }) {
  // get environment slug
  if (devMode) {
    return 'development';
  } else if (testing) {
    return 'testing';
  } else if (process.env.CIRCLE_BRANCH === 'master') {
    return 'production';
  } else if (
    /^Version-v(\d+)[.](\d+)[.](\d+)/u.test(process.env.CIRCLE_BRANCH)
  ) {
    return 'release-candidate';
  } else if (process.env.CIRCLE_BRANCH === 'develop') {
    return 'staging';
  } else if (process.env.CIRCLE_PULL_REQUEST) {
    return 'pull-request';
  }
  return 'other';
}

function buildAllHtmlFiles({
  failOnUnknownLabel = true,
  groupLabel,
  groupSet,
  commonSet,
  browserPlatforms,
}) {
  switch (groupLabel) {
    case 'ui': {
      renderHtmlFile('popup', groupSet, commonSet, browserPlatforms);
      renderHtmlFile('notification', groupSet, commonSet, browserPlatforms);
      renderHtmlFile('home', groupSet, commonSet, browserPlatforms);
      break;
    }
    case 'phishing-detect': {
      renderHtmlFile('phishing', groupSet, commonSet, browserPlatforms);
      renderHtmlFile('phishing_en', groupSet, commonSet, browserPlatforms);
      break;
    }
    case 'background': {
      renderHtmlFile('background', groupSet, commonSet, browserPlatforms);
      break;
    }
    default: {
      if (failOnUnknownLabel) {
        throw new Error(`buildsys - unknown groupLabel "${groupLabel}"`);
      }
    }
  }
}

function renderHtmlFile(htmlName, groupSet, commonSet, browserPlatforms) {
  const htmlFilePath = `./app/${htmlName}.html`;
  const htmlTemplate = readFileSync(htmlFilePath, 'utf8');

  // auto inject js files to html
  const jsBundles = [
    // fixed modules ahead ----------------------------------------------
    ...configs.externalModulesHtmlInjectJs,
    'lockdown-run', // secure ES module, which cause mobx, solanaWeb3 init fail.
    !IS_LEGACY_BUILD && 'runtime-cjs',
    // ----------------------------------------------
    ...commonSet.values(),
    ...groupSet.values(),
  ]
    .filter(Boolean)
    .map((label) => `./${label}.js?_t=${new Date().getTime()}.00000`);

  const htmlOutput = Sqrl.render(htmlTemplate, { jsBundles });
  browserPlatforms.forEach((platform) => {
    const dest = `./dist/${platform}/${htmlName}.html`;
    const dest2 = `./dist/${platform}/${htmlName}.bak.html`;
    // console.log('htmlOutput', htmlOutput);
    // we dont have a way of creating async events atm
    writeFileSync(dest, htmlOutput);
    writeFileSync(dest2, htmlOutput);
  });
}

function beep() {
  process.stdout.write('\x07');
}

function gracefulError(err) {
  console.warn(err);
  beep();
}
