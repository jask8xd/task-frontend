try {
  core.info(github.context.eventName);
  if (github.context.eventName !== 'pull_request') {
    core.info('Skipping as it is not pull request');
    return;
  }

  const token = core.getInput('token');
  const headers = {};
  if (token) {
    core.info('Using specified token');
    headers.Authorization = `token ${token}`;
  }

  const baseSha = github.context.payload.pull_request.base.sha;
  const headSha = github.context.payload.pull_request.head.sha;

  core.info(`Comparing ${ headSha } to ${ baseSha }`);
  const baseUrl = `https://raw.githubusercontent.com/${ github.context.repo.owner }/${ github.context.repo.repo }/${ baseSha }/package.json`

  fetch(baseUrl, { headers })
    .then(res => res.json())
    .then(res => res.version)
    .then(version => {
      const localVersion = require(`${ process.env.GITHUB_WORKSPACE }/package.json`).version;

      if (!semver.valid(localVersion)) core.setFailed(`Current version '${ localVersion }' detected as invalid one`);
      if (!semver.gt(localVersion, version)) core.setFailed(`Version '${ localVersion }' wasn't detected as greater than '${ version }'`);
    })
    .catch(core.setFailed);
} catch (error) {
  core.setFailed(error.message);
}