const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const semver = require('semver');

try {
  const token = core.getInput('token');
  console.log(token);
  const headers = {};
  const baseSha = github.context.payload.pull_request.base.sha;
  const headSha = github.context.payload.pull_request.head.sha;

  core.info(`Comparing ${ headSha } to ${ baseSha }`);
  const baseUrl = `https://raw.githubusercontent.com/${ github.context.repo.owner }/${ github.context.repo.repo }/${ baseSha }/package.json`

  fetch(baseUrl, { headers })
    .then(res => res.json())
    .then(res => res.version)
    .then(version => {
      const localVersion = require(`${ process.env.GITHUB_WORKSPACE }/package.json`).version;
      core.info('Version que estoy enviando:', localVersion);
      core.info('Version en el server:', version);
      if (!semver.valid(localVersion)) core.setFailed(`Current version '${ localVersion }' detected as invalid one`);
      if (!semver.gt(localVersion, version)) core.setFailed(`Version '${ localVersion }' wasn't detected as greater than '${ version }'`);
    })
    .catch(core.setFailed);
} catch (error) {
  core.setFailed(error.message);
}