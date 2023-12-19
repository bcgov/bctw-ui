![Lifecycle: Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)

# BC Telemetry Warehouse: Application - Updated: 19/12/23

## Note:

This application is a multi repo project. The `make` commands provided here are working similarily to a mono repo.
The bctw application installation now expects BOTH the bctw-api and bctw-ui directories to exist in the same parent directory


---

# Developer Quick Start: localhost:8080

## See Makefile for available `make` commands

### Quick Start Requirements:

- bctw-ui + bctw-api repos pulled and in same directory
- docker installed
- openshift oc commands installed
- make installed
- port-forwarding to dev database pod

### First time:

- `make env` from within bctw-ui dir
- update .env with values from Openshift secrets

### Every time:

- `oc port-forward <bctw-dev-pod-name> 5432:5432 &`
- `make web` from within bctw-ui dir


---

# Full installation instructions

# Pre-reqs

## Install Node/NPM

- Requires Node version 12+
- https://nodejs.org/en/download/


## Install Git

- https://git-scm.com/downloads


### Clone the repos

- `git clone https://github.com/bcgov/bctw-ui.git`
- `git clone https://github.com/bcgov/bctw-api.git`


## Install Docker

- https://www.docker.com/products/docker-desktop

### Windows

_Note: there are 2 mutually exclusive modes that Docker Desktop supports on Windows: Hyper-V or WSL2. You should be able to run the application in either mode, but this documentation was only written with instructions for Hyper-V. See https://code.visualstudio.com/blogs/2020/03/02/docker-in-wsl2 for possible instructions on using Docker Desktop in WSL2._
If prompted, install Docker using Hyper-V (not WSL 2)


### Grant Docker access to your local folders

This setup uses volumes to support live reload.
Ensure Docker Desktop has access to your file system so that it can detect file changes and trigger live reload.


#### MacOS

- In the Docker-Desktop app:
  - Go to settings (gear icon)
  - Now go to Resources
  - Go to File Sharing
  - Add the folder/drive your repo is cloned under
    - This will grant Docker access to the files under it, which is necessary for it to detect file changes.


#### Windows

- In the Docker-Desktop app:
  - Go to settings (gear icon)
  - On the general tab ensure that the `Use the WSL 2 based engine` is unchecked.
    - If it is checked, uncheck it, and click `Apply & Restart`
      - Docker may crash, but that is fine, you can kill docker for now.
    - You will then need to go to the following URL and follow the instructions in the first section `Enable Hyper-V using Powershell`: https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v
      - This should just consist of running the 1 command in Powershell (as Admin): `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All`
    - Once the powershell command has been run, it will ask you to restart your machine.
    - Once restarted, re-launch Docker, and check that docker starts successfully and that the `Use the WSL 2 based engine` setting is still unchecked
  - Go to settings (gear icon)
  - Now go to Resources
  - Go to File Sharing
  - Add the folder/drive your repo is cloned under
    - This will grant Docker access to the files under it, which is necessary for it to detect file changes.


## Ensure you can run the `make` command

### MacOS

- Install make: `brew install make`
  - https://formulae.brew.sh/formula/make

### Windows

- Install chocolatey: https://chocolatey.org/install#install-step2
- Install make: `choco install make`
  - https://community.chocolatey.org/packages/make

_Note: you will need to run choco commands in a terminal as administrator_


## 0. Download OC Command Line Tools (One Time)

1. Login to the OCP4 console using your GitHub credentials and click the question mark icon (?) in the top right side of the app bar, then click **Command Line Tools**.

2. Download the command line tools for **Linux**, even if you are running Windows. Using an appropriate archive tool (like 7-Zip), unzip the `oc` executable to your **{source_folder}/bctw-ui** folder.

- Make sure the `oc` executable is already in the **{source_folder}/bctw-ui** folder or the **_build will fail_**.


## 1. Login to Openshift using OC Command Line Tools (Every Time)

#### This grants access to the pods on Openshift, needed for Port Forwarding

2. In a web browser login to the OCP4 console using your GitHub credentials . Click the question mark icon (?) in the top right side of the app bar, select **Command Line Tools**, and then **Copy Login Command**.

3. Click on the **Display Token** link and copy the string that begins `oc login...`.

4. Back in the WSL / Command Prompt, paste the login command, prepending a `./` IF using the Linux OC executable.

```
  ./oc login --token=<some_token> --server=<some_server>
```

## 2. Port forward the database connection (Every Time)

#### More information in DEV_PORT_FORWARD.md if needed

5. Get the name of the current database pod.

```
  ./oc get pods
```

#### The database pod name starts with `bctw-db-...`

6. Port forward local connections on port 5432 to the database pod.

```
  ./oc port-forward <database_pod_name> 5432:5432 &
```

#### Note the trailing ampersand.


## 3. Generate .env (One Time)

Populate missing .env values with secrets from Openshift

```
    make env
```

## 4. Run docker containers - App / Proxy / Api - (Every Time)

```
    make web
```

### Default Urls

1. localhost:8080 (Proxy) access application here
2. localhost:3000 (Api) test endpoints with postman here
3. localhost:1111 (App) view logs and lint warnings here


## Developer environment information

Note: The App container only runs in local environments. In production the application uses ONLY the Proxy and Api

### The development application works in three parts:

1. App (UI / Frontend) > bctw-ui/react
    - Hosts the frontend react files

2. Api > bctw-api/bctw-api
    - Hosts the api which connects to the bctw database
    - expects keycloak token as Bearer auth

3. Proxy > bctw-ui/backend
    - Proxy handles keycloak confidential client and re-routing requests from App - Api
    - Application is accessible using the proxy url. Usually localhost:8080
    - Developers must have an IDIR
    - Handles keycloak login

### Production has an additional part:

1. Cronjobs > bctw-api/data-collector
    - retrieves the vendor telemetry and refreshes materialized views
    - TODO: update docker containers to include build instructions for cronjobs


### Application flow (Dev / Local)

1. localhost:8080/home -> Proxy (bctw-ui/backend) -> App
    - proxies the frontend page requests to the live frontend (App) server
    - hot reloading enabled for development

2. localhost:8080/api/get-user -> Proxy -> Api -> Database (Dev)
    - proxies the api requests to live Api (bctw-api/bctw-api)


### Application flow (Production)

1. https://telemetry.nrs.gov.bc.ca/home -> Proxy (bctw-ui/backend)
    - express hosts static files from build directory

2. https://telemetry.nrs.gov.bc.ca/home/api/get-user -> Proxy (bctw-ui/backend) -> Api -> Database (Prod)


## OpenShift ##

OpenShift details including build, deployment and pipelines are in the [openshift](openshift/README.md) folder.




