const { promises: fs } = require('fs');
const fse = require('fs-extra');
const gulp = require('gulp');
const gulpZip = require('gulp-zip');
const del = require('del');
const pify = require('pify');
const pump = pify(require('pump'));
const httpServer = require('http-server');
const notifier = require('node-notifier');
const { version } = require('../../package.json');
const { createTask, composeParallel } = require('./task');
const buildUtils = require('./buildUtils');

module.exports = createEtcTasks;

function createEtcTasks({ browserPlatforms, livereload }) {
  const clean = createTask('clean', async function clean() {
    await del(['./dist/*', './builds/*', './ui/app/css/output/*']);
    await Promise.all(
      browserPlatforms.map(async (platform) => {
        await fs.mkdir(`./dist/${platform}`, { recursive: true });
      }),
    );
  });

  const reload = createTask('reload', function devReload() {
    livereload.listen({ port: 35729 });
  });

  // zip tasks for distribution
  const zip = createTask(
    'zip',
    composeParallel(
      ...browserPlatforms.map((platform) =>
        createZipTask(platform, `onekey-${platform}-${version}.zip`),
      ),
      createZipTask('sourcemaps', `sourcemaps-${version}.zip`),
    ),
  );

  const moduleFix = createModuleFixTask();

  const sourcemapServer = createTask('sourcemapServer', async function () {
    const server = httpServer.createServer({
      root: './dist',
    });
    server.listen(31317);
  });

  const extractZipBash = createTask('extractZipBash', async function () {
    createExtractBashText(browserPlatforms);
  });

  const done = createTask('done', function () {
    notifier.notify('Build complete!');
  });

  return {
    done,
    clean,
    reload,
    zip,
    moduleFix,
    extractZipBash,
    sourcemapServer,
  };
}

function createExtractBashText(platforms) {
  const optionsChoice = platforms.map((p) => `"${p}"`).join(' ');
  const writeFileName = 'builds/extract-zip.command';
  fse.writeFileSync(
    writeFileName,
    `#!/bin/bash

set -x

PS3='Please enter your choice: '
options=(${optionsChoice} "Quit")
version="${version}"
select opt in "\${options[@]}"
do
    case $opt in
        "firefox")
            echo "you chose choice $REPLY which is $opt"
            break
            ;;
        "chrome")
            echo "you chose choice $REPLY which is $opt"
            break
            ;;
        "brave")
            echo "you chose choice $REPLY which is $opt"
            break
            ;;
        "opera")
            echo "you chose choice $REPLY which is $opt"
            break
            ;;
        "Quit")
            exit
            break
            ;;
        *) echo "invalid option $REPLY";;
    esac
done

basename=\`dirname "$0"\`
file="$basename/onekey-$opt-$version"
unzip -o $file -d $file
cp "$file/manifest.test.json" "$file/manifest.json"
  `,
  );
  fse.chmod(writeFileName, 0o777);
}

function createZipTask(target, filename) {
  return async () => {
    await pump(
      gulp.src(`dist/${target}/**`),
      gulpZip(filename),
      gulp.dest('builds'),
    );
  };
}

function rewriteJsonFile(file, processHandler) {
  const json = fse.readJsonSync(file);
  processHandler(json);
  fse.writeJsonSync(file, json, { spaces: 2 });
}

function createModuleFixTask() {
  return createTask('moduleFix', async () => {
    /*
    @heroicons/react missing main field will cause browserify error:
       Cannot find module '@heroicons/react'
          at /node_modules/browser-resolve/node_modules/resolve/lib/async.js:46:17
    */
    rewriteJsonFile(
      'node_modules/@heroicons/react/package.json',
      (json) => (json.main = json.main || 'outline/index.js'),
    );

    /*
    SyntaxError: 'import' and 'export' may appear only with 'sourceType: module' (1:0)
        while parsing node_modules/@solana/web3.js/lib/index.browser.esm.js
        while parsing file: node_modules/@solana/web3.js/lib/index.browser.esm.js

     NOT working: index.cjs.js has fetch() error.
     */
    // rewriteJsonFile(
    //   'node_modules/@solana/web3.js/package.json',
    //   (json) => delete json.browser,
    // );
  });
}
