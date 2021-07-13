//
// build task definitions
//
// run any task with "yarn build ${taskName}"
//
const childProcess = require('child_process');
require('../dotEnvLoad');
const livereload = require('gulp-livereload');
const {
  createTask,
  composeSeries,
  composeParallel,
  detectAndRunEntryTask,
} = require('./task');
const createManifestTasks = require('./manifest');
const createScriptTasks = require('./scripts');
const createStyleTasks = require('./styles');
const createStaticAssetTasks = require('./static');
const createEtcTasks = require('./etc');

const browserPlatforms = ['firefox', 'chrome', 'brave', 'opera'];

const moduleCssFile = 'src/styles/tailwind.module.css';
childProcess.exec(`touch ${moduleCssFile}`);

defineAllTasks();
detectAndRunEntryTask();

function defineAllTasks() {
  const staticTasks = createStaticAssetTasks({ livereload, browserPlatforms });
  const manifestTasks = createManifestTasks({ browserPlatforms });
  const styleTasks = createStyleTasks({ livereload });
  const scriptTasks = createScriptTasks({ livereload, browserPlatforms });
  const { clean, reload, zip, moduleFix } = createEtcTasks({
    livereload,
    browserPlatforms,
  });

  // build for development (livereload)
  createTask(
    'dev',
    composeSeries(
      moduleFix,
      clean,
      composeParallel(
        scriptTasks.dev,
        staticTasks.dev,
        manifestTasks.dev,
        reload,
      ),
      styleTasks.dev,
    ),
  );

  // build for test development (livereload)
  createTask(
    'testDev',
    composeSeries(
      moduleFix,
      clean,
      composeParallel(
        scriptTasks.testDev,
        staticTasks.dev,
        manifestTasks.testDev,
        reload,
      ),
      styleTasks.dev,
    ),
  );

  // build for prod release
  createTask(
    'prod',
    composeSeries(
      moduleFix,
      clean,
      composeParallel(scriptTasks.prod, staticTasks.prod, manifestTasks.prod),
      styleTasks.prod,
      zip,
    ),
  );

  // build for CI testing
  createTask(
    'test',
    composeSeries(
      moduleFix,
      clean,
      composeParallel(scriptTasks.test, staticTasks.prod, manifestTasks.test),
      styleTasks.prod,
      zip,
    ),
  );

  // special build for minimal CI testing
  createTask('styles', styleTasks.prod);
}
