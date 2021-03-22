'use strict';

let options= require('pipeline-cli').Util.parseArguments()

const config = require('../../.config/config.json');
const changeId =`${Math.floor((Date.now() * 1000)) / 60.0}`;
const version = config.version || '1.0.0';
const name = 'bctw-ui';

// Get SSO_Info
const sso = config.sso;

const branch = options.branch;
const tag = `build-${version}-${changeId}`;

const processOptions = (options) => {
  const result = { ...options };
  // Check git
  if (!result.git.url.includes('.git')) {
    result.git.url = `${result.git.url}.git`
  }
  if (!result.git.http_url.includes('.git')) {
    result.git.http_url = `${result.git.http_url}.git`
  }

  // Fixing repo
  if (result.git.repository.includes('/')) {
    const last = result.git.repository.split('/').pop();
    const final = last.split('.')[0];
    result.git.repository = final;
  }
  return result;
};

options = processOptions(options);

console.log(`${JSON.stringify(options, null, 2)}`);


const phases = {
  build: {
    namespace:'0dff19-tools'    ,
    name: `${name}`, 
    phase: 'build'  , 
    tag: tag,
    branch: branch
  },
  dev: {
    namespace:'0dff19-dev'    , 
    name: `${name}`, 
    phase: 'dev'  , 
    tag: 'dev',
    env: 'dev',
    sso: sso.dev,
    replicas: 1,
    maxReplicas: 1
  },
  test: {
    namespace:'0dff19-test'    , 
    name: `${name}`, 
    phase: 'test'  , 
    tag:`test`, 
    env: 'test',
    sso: sso.test,
    replicas: 1,
    maxReplicas: 1
  }
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = {phases, options};
