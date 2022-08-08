const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

try {
  const token = core.getInput('token');
  const headers = {
    Authorization: `token ${token}`
  };
  const baseSha = github.context.payload.pull_request.base.sha;
  const baseUrl = `https://raw.githubusercontent.com/${ github.context.repo.owner }/${ github.context.repo.repo }/${ baseSha }/package.json`

  fetch(baseUrl, { headers })
    .then(res => res.json())
    .then(res => res.version)
    .then(version => {
      const localVersion = require(`${ process.env.GITHUB_WORKSPACE }/package.json`).version;
      const versionArr = version.split('.');
      const requiredVersion = `${versionArr[0]}.${versionArr[1]}.${Number(versionArr[2])+1}`
      if(requiredVersion !== localVersion) core.setFailed(`Current version '${ localVersion }' should be the version '${ requiredVersion }'`);
    })
    .catch(core.setFailed);
} catch (error) {
  core.setFailed(error.message);
}