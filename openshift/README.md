British Columbia Telemetry Warehouse - BCTW-UI
======================

## Running in OpenShift

This project uses the scripts found in [openshift-project-tools](https://github.com/BCDevOps/openshift-project-tools) to setup and maintain OpenShift environments (both local and hosted).  Refer to the [OpenShift Scripts](https://github.com/BCDevOps/openshift-project-tools/blob/master/bin/README.md) documentation for details.

**These scripts are designed to be run on the command line (using Git Bash for example) in the root `openshift` directory of your project's source code.**

## Prior to importing OpenShift objects

The following steps must be done prior to importing the OpenShift objects for the application:

1. Obtain Admin access to the Tools namespace in OpenShift that will be used for the project
2. Obtain Admin access to the GitHub repository that will be used to store the code for the project (this is also the repository where this file is located)
3. Login to the OpenShift console and obtain a token that can be used from a command prompt or shell

Prior to importing OpenShift object manifests, ensure that you have completed the initial configuration by doing the following:

1. Verify the "licence plate" in openshift/settings.sh matches the actual project namespace set you have
2. Run `initOSProjects.sh` to update the permissions on the projects.  This will allow projects other than "tools" for your project namespace set to access the images located in "tools"
3. Import any required images.  

## Running in a Local OpenShift Cluster

At times running in a local cluster is a little different than running in the production cluster.

Differences can include:
* Resource settings.
* Available image runtimes.
* Source repositories (such as your development repo).
* Etc.

To target a different repo and branch, create a `settings.local.sh` file in your project's local `openshift` directory and override the GIT parameters, for example;
```
export GIT_URI="https://github.com/bcgov/bctw-ui.git"
export GIT_REF="openshift-updates"
```

Then run the following command from the project's local `openshift` directory:
```
genParams.sh -l
```

**Git Bash Note:  Ensure that you do not have a linux "oc" binary on your path if using Git Bash on a Windows PC to run the scripts.  A windows "oc.exe" binary will work fine.

### Preparing for local deployment

1. Install the oc cli.  
2. Start an OpenShift cluster.  If you are using Docker you can use the `oc-cluster-up.sh` scripts from [openshift-project-tools](https://github.com/BCDevOps/openshift-project-tools).
3. Run `generateLocalProjects.sh` to create the projects in your local cluster.
4. Run `initOSProjects.sh` to update the deployment permissions on the projects.
5. To fix the routes in your local deployment environments use the `updateRoutes.sh` script.

From here on out the commands used to deploy and management the application configurations are basically the same for a local cluster as they are for the Pathfinder environment.

## Deploying your project

All of the commands listed in the following sections must be run from the root `openshift` directory of your project's source code.

### Initialization

If you are working with a new set of OpenShift projects, or if you have run a `oc delete all --all` to start over, run the `initOSProjects.sh` script, this will repair the cluster file system services (in the Pathfinder environment), and ensure the deployment environments have the correct permissions to deploy images from the tools project.

## Webhook secrets

This project will require a webhook secret to be created.  Prior to configuring the build, create a webhook secret with the name "bctw-ui-webhook".  Make note of the generated value of this secret as you will need it when configuring the webhook in github.

## BUILD CONFIG

Run the following commands from the root "openshift" folder of this repository:

`oc process -f templates/bctw-ui/bctw-ui-build.yaml  --param-file ../../../../params/bctw-ui-build.params  | oc create -f -`

## DEPLOYMENT CONFIG

Run the following commands from the root "openshift" folder of this repository:

`oc process -f templates/bctw-ui/bctw-ui-deploy.yaml  --param-file ../../../../params/bctw-ui/bctw-ui-deploy-<ENVIRONMENT>.params | oc create -f -`

Substitute <ENVIRONMENT> for the environment name you are deploying to (dev/test/prod).  Environment paramaters are not included in this repository.

### Wire up GitHub Webhooks

1. Use oc describe on a given build or pipeline to obtain the webhook URL.  Not that you will have to substitute the actual secret in this URL.
2. Enter this URL (with the secret) into the URL field for the webhook.
3. Set the content type to **application/json**
4. Select **Just the push event**
5. Check **Active**
6. Click **Add webhook**
7. Check to ensure the webhook worked.