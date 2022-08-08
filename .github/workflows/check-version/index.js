const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const semver = require('semver');

try {
  const token = core.getInput('token');
  console.log(token);
  const headers = {};
  const baseSha = github.context.payload.pull_request.base.sha;

  const baseUrl = `https://raw.githubusercontent.com/${ github.context.repo.owner }/${ github.context.repo.repo }/${ baseSha }/package.json`

  fetch(baseUrl, { headers })
    .then(res => res.json())
    .then(res => res.version)
    .then(version => {
      const localVersion = require(`${ process.env.GITHUB_WORKSPACE }/package.json`).version;
      core.info(`Version que estoy enviando: ${localVersion} tipo: ${typeof localVersion }`);
      core.info(`Version en el server: ${version} tipo: ${typeof version }`);
      const versionArr = version.split('.');
      const requiredVersion = `${versionArr[0]}.${versionArr[1]}.${Number(versionArr[2])+1}`
      core.info(`Version requerida: ${requiredVersion}`);
      if(requiredVersion !== localVersion) core.setFailed(`Current version '${ localVersion }' should be the version '${ requiredVersion }'`);
    })
    .catch(core.setFailed);
} catch (error) {
  core.setFailed(error.message);
}