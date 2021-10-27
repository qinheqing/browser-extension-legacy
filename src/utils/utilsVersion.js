/* eslint import/no-cycle: "error" */
import extension from 'extensionizer';

const versionInfo = {
  version: extension.runtime.getManifest().version,
  build: process.env.GITHUB_TAG || '',
  versionFull: '',
};
versionInfo.versionFull = `v${versionInfo.version}`;
if (versionInfo.build) {
  const buildSimple = (versionInfo.build || '')
    .replace(`v${versionInfo.version}-`, '')
    .replace(`v${versionInfo.version}`, '')
    .replace(`${versionInfo.version}`, '');
  if (buildSimple) {
    versionInfo.versionFull = `v${versionInfo.version} (${buildSimple})`;
  }
}

function getVersionInfo() {
  return versionInfo;
}

export default {
  getVersionInfo,
};
