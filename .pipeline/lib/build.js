'use strict';
const {OpenShiftClientX} = require('pipeline-cli')
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases
  const options = settings.options
  const oc = new OpenShiftClientX(Object.assign({'namespace':phases.build.namespace}, options));
  const phase='build'
  let objects = []
  const templatesLocalBaseUrl =oc.toFileUrl(path.resolve(__dirname, '../../openshift'))

  // The building of your cool app goes here ▼▼▼
  objects.push(...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.bc.yaml`, {
    'param':{
      'NAME': phases[phase].name,
      'GIT_REPO_URL': oc.git.http_url,
      'GIT_REF': 'main',
      'OUTPUT_IMAGE_TAG': options.env || 'latest'
    }
  }));

  console.log(`${JSON.stringify(objects, null, 2)}`);
  oc.applyAndBuild(objects)
}
