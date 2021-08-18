require('../dotEnvLoad');
const childProcess = require('child_process');
const assert = require('assert');
const path = require('path');
const { LokaliseApi } = require('@lokalise/node-api');
const fse = require('fs-extra');
const klawSync = require('klaw-sync');
const lodash = require('lodash');
const debug = require('debug');

const log = debug('i18n_update:lokalise');
debug.enable('i18n_update:lokalise');

const projectId = process.env.ENV_I18N_LOKALISE_PROJECT_ID;
const apiKey = process.env.ENV_I18N_LOKALISE_PROJECT_API_KEY;

assert(projectId, 'process.env.ENV_I18N_LOKALISE_PROJECT_ID missing');
assert(apiKey, 'process.env.ENV_I18N_LOKALISE_PROJECT_API_KEY missing');

const lokaliseApi = new LokaliseApi({ apiKey });
const tmpFolder = './.lokalise/';
const jsonDownloadPath = './.lokalise/locale/';
const destBackupFolder = './.lokalise/backup/';
const destFolder = './app/_locales/';

function cleanFolder() {
  log(`rm cache folder: ${jsonDownloadPath}`);
  childProcess.execSync(`rm -rf ${tmpFolder}       `);
  childProcess.execSync(`mkdir -p ${jsonDownloadPath}    `);
  childProcess.execSync(`mkdir -p ${destBackupFolder}    `);
}

function backupFiles() {
  childProcess.execSync(
    `rsync "${destFolder}"  "${destBackupFolder}"  --checksum  --recursive --verbose `,
  );
  const files = klawSync(destBackupFolder, { nodir: true });
  files.forEach((file) => {
    const folder = path.dirname(file.path);
    const langISO = path.basename(folder);

    rewriteJsonFile({
      src: file.path,
      dest: path.join(folder, `${langISO}.json`),
      processHandler: (json) => {
        const newJson = {};
        Object.entries(json).forEach(([k, v]) => {
          newJson[k] = v.message || '';
        });
        return newJson;
      },
    });
  });
}

function downloadFiles() {
  log(`download json files`);
  return (
    lokaliseApi.files
      // https://app.lokalise.com/api2docs/curl/#transition-download-files-post
      .download(projectId, {
        format: 'json',
        original_filenames: false,
        bundle_structure: '%LANG_ISO%/messages.json',
      })
      .then((res) => {
        const url = res.bundle_url;
        log(`download url: ${url}`);
        log(`downloading...`);
        childProcess.execSync(`
        mkdir -p ${jsonDownloadPath}                && \\
        cd ${jsonDownloadPath}                       && \\
        curl -sS ${url} > file.zip               && \\
        unzip file.zip                            && \\
        rm file.zip
    `);
        log(`download success!`);
      })
  );
}

function rewriteFiles() {
  const files = klawSync(jsonDownloadPath, { nodir: true });
  files.forEach((file) => {
    rewriteJsonFile({
      src: file.path,
      processHandler: (json) => {
        const newJson = {};
        Object.entries(json).forEach(([k, v]) => {
          newJson[k] = lodash.isString(v) ? { message: v } : v;
        });
        return newJson;
      },
    });
  });

  childProcess.execSync(
    `rsync "${jsonDownloadPath}"  "${destFolder}"  --checksum  --recursive --verbose `,
  );
  log(`rsync to ${destFolder}`);
}

function rewriteJsonFile({ src, dest, processHandler, deleteSrc = false }) {
  // eslint-disable-next-line no-param-reassign
  dest = dest || src;
  const json = fse.readJsonSync(src);
  const newJson = processHandler(json);
  fse.writeJsonSync(dest, newJson || json, { spaces: 2 });
  if (deleteSrc && dest !== src) {
    childProcess.execSync(`rm ${src}`);
  }
  log(`rewrite json file from [${src}] to [${dest}]`);
}

function run() {
  cleanFolder();
  backupFiles();
  downloadFiles()
    .then(rewriteFiles)
    .catch((err) => {
      log(err);
      console.error(err);
    });
}

run();
