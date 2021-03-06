const { promises: fs } = require('fs');
const path = require('path');
const { merge, cloneDeep } = require('lodash');

const baseManifest = require('../../app/manifest/_base.json');
const { version } = require('../../package.json');

const { createTask, composeSeries } = require('./task');
const buildUtils = require('./buildUtils');

module.exports = createManifestTasks;

function createManifestTasks({ browserPlatforms }) {
  // merge base manifest with per-platform manifests
  const prepPlatforms = async () => {
    return Promise.all(
      browserPlatforms.map(async (platform) => {
        const platformModifications = await readJson(
          path.join(
            __dirname,
            '..',
            '..',
            'app',
            'manifest',
            `${platform}.json`,
          ),
        );

        const result = merge(
          cloneDeep(baseManifest),
          { version },
          platformModifications,
        );

        const resultTestVersion = cloneDeep(result);
        if (
          process.env.GITHUB_TAG &&
          // tag should like: v1.0.3-beta.1
          /^v[0-9.]+-\w+/giu.test(process.env.GITHUB_TAG || '')
        ) {
          // add GITHUB_TAG in description
          // convenience to identify different version for multiple extension testing
          resultTestVersion.description = `${resultTestVersion.description} (${process.env.GITHUB_TAG})`;
        }

        const dir = path.join('.', 'dist', platform);
        await fs.mkdir(dir, { recursive: true });
        await writeJson(result, path.join(dir, 'manifest.json'));
        await writeJson(result, path.join(dir, 'manifest.prd.json'));
        await writeJson(
          resultTestVersion,
          path.join(dir, 'manifest.test.json'),
        );
      }),
    );
  };

  // dev: add perms
  const envDev = createTaskForModifyManifestForEnvironment((manifest) => {
    manifest.description = `${manifest.description} (## DEV_VERSION ##)`;
    manifest.permissions = [...manifest.permissions, 'webRequestBlocking'];
    manifest.content_scripts[0].exclude_matches = [
      ...manifest.content_scripts[0].exclude_matches,
      // add localhost connect popup.html page supporting
      'https://localhost:8088/*',
      'http://localhost:8088/*',
    ];

    manifest.content_scripts[1].matches = [
      ...manifest.content_scripts[1].matches,
      // add localhost connect popup.html page supporting
      'https://localhost:8088/popup.html',
    ];
  });

  // testDev: add perms
  const envTestDev = createTaskForModifyManifestForEnvironment((manifest) => {
    manifest.permissions = [
      ...manifest.permissions,
      'webRequestBlocking',
      'http://localhost/*',
    ];
  });

  // test: add permissions
  const envTest = createTaskForModifyManifestForEnvironment((manifest) => {
    manifest.permissions = [
      ...manifest.permissions,
      'webRequestBlocking',
      'http://localhost/*',
    ];
  });

  // high level manifest tasks
  const dev = createTask('manifest:dev', composeSeries(prepPlatforms, envDev));

  const testDev = createTask(
    'manifest:testDev',
    composeSeries(prepPlatforms, envTestDev),
  );

  const test = createTask(
    'manifest:test',
    composeSeries(prepPlatforms, envTest),
  );

  const prod = createTask('manifest:prod', prepPlatforms);

  return { prod, dev, testDev, test };

  // helper for modifying each platform's manifest.json in place
  function createTaskForModifyManifestForEnvironment(transformFn) {
    return () => {
      return Promise.all(
        browserPlatforms.map(async (platform) => {
          const manifestPath = path.join(
            '.',
            'dist',
            platform,
            'manifest.json',
          );
          const manifest = await readJson(manifestPath);
          transformFn(manifest);
          await writeJson(manifest, manifestPath);
        }),
      );
    };
  }
}

// helper for reading and deserializing json from fs
async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

// helper for serializing and writing json to fs
async function writeJson(obj, file) {
  return fs.writeFile(file, JSON.stringify(obj, null, 2));
}
