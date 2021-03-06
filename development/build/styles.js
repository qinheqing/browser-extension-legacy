const childProcess = require('child_process');
const pify = require('pify');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const gulpStylelint = require('gulp-stylelint');
const watch = require('gulp-watch');
const sourcemaps = require('gulp-sourcemaps');
const rtlcss = require('gulp-rtlcss');
const rename = require('gulp-rename');
const pump = pify(require('pump'));
const { createTask } = require('./task');
const configs = require('./configs');
const buildUtils = require('./buildUtils');

let sass;

// scss compilation and autoprefixing tasks
module.exports = createStyleTasks;

function createStyleTasks({ livereload }) {
  const prod = createTask(
    'styles:prod',
    createScssBuildTask({
      src: ['ui/app/css/index.scss', 'src/styles/index.new.scss'],
      dest: 'ui/app/css/output',
      devMode: false,
    }),
  );

  const dev = createTask(
    'styles:dev',
    createScssBuildTask({
      src: ['ui/app/css/index.scss', 'src/styles/index.new.scss'],
      dest: 'ui/app/css/output',
      devMode: true,
      pattern: [
        '!src/styles/tailwind.output.css',
        '!ui/app/css/output/tailwind.css',
        'ui/app/**/*.scss',
        'src/**/*.scss',
      ],
      tailWindPattern: [
        '!src/styles/tailwind.output.css',
        '!ui/app/css/output/tailwind.css',
        'src/**/*.css',
        'tailwind.config.js',
      ],
    }),
  );

  const lint = createTask('lint-scss', function () {
    return gulp.src('ui/app/css/itcss/**/*.scss').pipe(
      gulpStylelint({
        reporters: [{ formatter: 'string', console: true }],
        fix: true,
      }),
    );
  });

  return { prod, dev, lint };

  function createScssBuildTask({
    src,
    dest,
    devMode,
    pattern,
    tailWindPattern,
  }) {
    return async function () {
      if (devMode) {
        watch(pattern, async (event) => {
          console.log(`[styles] gulp-watch file changed: ${event.path}`);
          await buildScss();
          livereload.changed(event.path);
        });
        const watchOpts = {
          events: ['add', 'change'],
          ignoreInitial: true,
          readDelay: 10,
          atomic: 1500,
          interval: 1500,
        };
        watch(tailWindPattern, async (event) => {
          console.log(`[styles] gulp-watch file changed: ${event.path}`);
          await buildTailwind();
          livereload.changed(event.path);
        });
      }
      await buildTailwind();
      await buildScss();
    };

    async function buildTailwind() {
      childProcess.execSync('set -x && yarn tailwind');
    }

    async function buildScss() {
      await Promise.all([
        buildScssPipeline(src, dest, devMode, false),
        buildScssPipeline(src, dest, devMode, true),
      ]);
    }
  }
}

async function buildScssPipeline(src, dest, devMode, rtl) {
  if (!sass) {
    // eslint-disable-next-line node/global-require
    sass = require('gulp-dart-sass');
    // use our own compiler which runs sass in its own process
    // in order to not pollute the intrinsics
    // eslint-disable-next-line node/global-require
    sass.compiler = require('./sass-compiler');
  }

  await pump(
    ...[
      // pre-process
      gulp.src(src),
      devMode && sourcemaps.init(),
      sass(configs.sassConfig).on('error', sass.logError),
      autoprefixer(),
      rtl && rtlcss(),
      rtl && rename({ suffix: '-rtl' }),
      devMode && sourcemaps.write(),
      gulp.dest(dest),
    ].filter(Boolean),
  );
}
