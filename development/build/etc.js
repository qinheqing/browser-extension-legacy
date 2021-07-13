const { promises: fs } = require('fs');
const gulp = require('gulp');
const gulpZip = require('gulp-zip');
const del = require('del');
const pify = require('pify');
const pump = pify(require('pump'));
const baseManifest = require('../../app/manifest/_base.json');
const { createTask, composeParallel } = require('./task');

module.exports = createEtcTasks;

function createEtcTasks({ browserPlatforms, livereload }) {
  const clean = createTask('clean', async function clean() {
    await del(['./dist/*']);
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
      ...browserPlatforms.map((platform) => createZipTask(platform)),
    ),
  );

  const moduleFix = createModuleFixTask();

  return { clean, reload, zip, moduleFix };
}

function createZipTask(target) {
  return async () => {
    await pump(
      gulp.src(`dist/${target}/**`),
      gulpZip(`onekey-${target}-${baseManifest.version}.zip`),
      gulp.dest('builds'),
    );
  };
}

function createModuleFixTask() {
  return createTask('moduleFix', async () => {
    // @heroicons/react missing main field will cause browserify error:
    //        Cannot find module '@heroicons/react'
    //              at /node_modules/browser-resolve/node_modules/resolve/lib/async.js:46:17
    // eslint-disable-next-line node/global-require
    const heroiconsJson = require('@heroicons/react/package.json');
    heroiconsJson.main = heroiconsJson.main || 'outline/index.js';
    await fs.writeFile(
      'node_modules/@heroicons/react/package.json',
      JSON.stringify(heroiconsJson, null, 2),
      'utf8',
    );
  });
}
