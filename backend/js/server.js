const axios = require('axios');
const cors = require('cors');
const express = require('express');
const expressSession = require('express-session');
const helmet = require('helmet');
const formData = require('form-data');
const http = require('http');
const keycloakConnect = require('keycloak-connect');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path')
const pg = require('pg');

const sessionSalt = process.env.BCTW_SESSION_SALT;

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const apiHost = `http://${process.env.BCTW_API_HOST}`;
const apiPort = process.env.BCTW_API_PORT;

// use Express memory store for session and Keycloak object
var memoryStore = new expressSession.MemoryStore();

// multer configuration for handling bulk imports
const storage = multer.memoryStorage();
const upload = multer({ storage });

// create a Keycloak config object (deprecates use of keycloak.json)
// see: https://wjw465150.gitbooks.io/keycloak-documentation/content/securing_apps/topics/oidc/nodejs-adapter.html
var keyCloakConfig = {
  authServerUrl: process.env.KEYCLOAK_SERVER_URL,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  public: true,
  realm: process.env.KEYCLOAK_REALM
};

// instantiate Keycloak Node.js adapter, passing in configuration
var keycloak = new keycloakConnect({
  store: memoryStore
}, keyCloakConfig);

// set up the session
var session = {
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1,000 days
    secure: false
  },
  resave: false,
  saveUninitialized: true,
  secret: sessionSalt,
  store: memoryStore
};

// TODO: move into separate package?
// creates a well-formed URL with query string given a parameter
const appendQueryToUrl = (url, parameter) => {
  if (!parameter) return url;
  return url.includes('?') ? url += `&${parameter}` : url += `?${parameter}`;
};

// TODO: move into separate package?
// split out the username and  domain ('username@idir' or 'username@bceid') from Keycloak preferred_username
const splitCredentials = (sessionObject) => {
  const credentials = sessionObject.preferred_username.split('@');
  if (!credentials.length) {
    return {};
  }
  return { username: credentials[0], domain: credentials[1] };
}

// TODO: move into separate package?
// endpoint that returns Keycloak session information
const retrieveSessionInfo = function (req, res, next) {
  if (!isProd) {
    return res.status(500).send('Keycloak session info available: not PROD environment');
  }
  // get contents of the current Keycloak access token
  const data = req.kauth.grant.access_token.content;
  if (!data) {
    return res.status(500).send('Error: Unable to retrieve Keycloak session information');
  }
  const { family_name, given_name, email } = data;
  const sessionInfo = {
    email,
    family_name,
    given_name,
    ...splitCredentials(data)
  }
  res.status(200).send(sessionInfo);
}

// TODO: move into separate package?
// Keycloak-protected service for proxying calls to the API host (browser -> proxy -> API)
const proxyApi = function (req, res, next) {

  // URL of the endpoint being targeted
  const endpoint = req.params.endpoint;

  // create a string of key-value pairs from the parameters passed
  const parameters = Object.keys(req.query).map((key) => {
    return `${key}=${req.query[key]}`;
  }).join('&');

  let url;
  if (isProd) {

    // split out the domain and username of logged-in user
    const { domain, username } = splitCredentials(req.kauth.grant.access_token.content);

    // build up URL from ENV variables and targeted endpoint
    url = `${apiHost}:${apiPort}/${endpoint}`;

    // if endpointId is known, append to URL
    if (req.params.endpointId) {
      url += `/${req.params.endpointId}`;
    }

    // add parameters and username to URL
    url = appendQueryToUrl(url, parameters);
    url = appendQueryToUrl(url, `${domain}=${username}`)

  } else {
    // connect to API without using Keycloak authentication
    url = `${apiHost}:${apiPort}/${endpoint}?${parameters}`;
  }

  const errHandler = (err) => {
    const { response } = err;
    console.error(response);
    res.status(response.status).json({ error: response.data });
  }

  const successHandler = (response) => res.json(response.data);

  if (req.method === 'POST') {
    const { file, files } = req;
    if (file || files) {
      // depending on the type of file uploaded
      // create a new formdata object to pass on to the server
      const { form, config } = file ? handleFile(file) : handleFiles(files);
      // console.log(JSON.stringify(form, null, 2));
      axios.post(url, form, config)
        .then(successHandler)
        .catch(errHandler)
    } else {
      axios.post(url, req.body)
        .then(successHandler)
        .catch(errHandler)
    }
  } else if (req.method === 'DELETE') {
    axios.delete(url)
      .then(successHandler)
      .catch(url)
  }
  // handle get
  else {
    axios.get(url)
      .then(successHandler)
      .catch(errHandler);
  }
};

/**
  * csv files can only be imported one at a time
 */
const handleFile = function (file) {
  if (file) {
    const form = new formData();
    form.append('csv', file.buffer, file.originalname);
    return { form, config: { headers: form.getHeaders() } }
  }
}

/*
  * multiple xml files can be processed
*/
const handleFiles = function (files) {
  if (files && files.length) {
    const form = new formData();
    files.forEach(f => form.append(f.fieldname, f.buffer, f.originalname));
    // Axios will throw if posting the form as an array, specify the json option to stringify it
    return { form, config: { headers: form.getHeaders(), options: { json: true } } }
  }
}

/* ## gardenGate
  Check that the user is authenticated before continuing.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
*/
const gardenGate = function (req, res, next) {
  if (keycloak.checkSso()) {
    return next();
  } else {
    console.log('User NOT authenticated; denying access');
    return res.status(404).send('<p>Error: You must be authenticated to use this application.</p>');
  }
};

/* ## notFound
  Catch-all router for any request that does not have an endpoint defined.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
 */
const notFound = function (req, res) {
  return res.status(404).send('<p>Express server.js says: : Sorry, but you must be lost.</p>');
};

/* ## pageHandler
  Pass-through function for Express.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
  @param next {function} Node/Express function for flow control
 */
const pageHandler = function (req, res, next) {
  return next();
};

const handleUserAccessRequest = async (req, res) => {
  // This data will be inserted into the email
  const {
    accessType,
    domain,
    email,
    firstName,
    lastName,
    populationUnit,
    projectManager,
    projectName,
    projectRole,
    reason,
    region,
    species,
    textMessageNumber,
    username,
  } = req.body;

  const data = req.kauth.grant.access_token.content;

  // TODO: This has to be tested in dev unfortunately
  // console.log('handleUserAccessRequest() -- Keycloak data', data);
  // console.log('handleUserAccessRequest() -- message contents', req.body);

  // Get all the environment variable dependencies
  const chesTokenUrl = `${process.env.BCTW_CHES_AUTH_URL}/protocol/openid-connect/token`;
  const chesApiUrl = `${process.env.BCTW_CHES_API_URL}/api/v1/email`;
  const chesUsername = process.env.BCTW_CHES_USERNAME;
  const chesPassword = process.env.BCTW_CHES_PASSWORD;
  const chesFromEmail = process.env.BCTW_CHES_FROM_EMAIL;
  const chesToEmail = process.env.BCTW_CHES_TO_EMAIL.split(',');

  console.log('handleUserAccessRequest() -- CHES token URL:', chesTokenUrl);
  console.log('handleUserAccessRequest() -- CHES API URL:', chesApiUrl);
  console.log('handleUserAccessRequest() -- CHES username:', chesUsername);
  console.log('handleUserAccessRequest() -- CHES fromEmail:', chesFromEmail);
  console.log('handleUserAccessRequest() -- CHES toEmail:', chesToEmail);

  // Create the authorization hash
  const prehash = Buffer.from(`${chesUsername}:${chesPassword}`, 'utf8').toString('base64');
  const hash = `Basic ${prehash}`;

  const tokenParcel = await axios.post(
    chesTokenUrl,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: hash
      }
    });

  const pretoken = tokenParcel.data.access_token;
  if (!pretoken) return res.status(500).send('Authentication failed');
  const token = `Bearer ${pretoken}`;
  console.log('handleUserAccessRequest() -- bearer token obtained');

  const emailMessage = `
    <div>
      Access to the BC Telemetry Warehouse has been requested by
      <b>${domain}</b> user <b>${firstName} ${lastName}</b>. Username is <b>${username}</b>.
    </div>
    <br />
    <div>
      <u>Details</u>:
    </div>
    <p>
      Access type: <b>${accessType}</b><br />
      Population Unit: <b>${populationUnit}</b><br />
      Project Manager: <b>${projectManager}</b><br />
      Project Name: <b>${projectName}</b><br />
      Project Role: <b>${projectRole}</b><br />
      Region: <b>${region}</b><br />
      Species: <b>${species}</b><br />
      Text Message Number: <b>${textMessageNumber}</b><br />
    </p>
    <br />
    <div>
      <u>Provided reason is as follows</u>:
    </div>
    <div style="padding=10px; color: #626262;">
      ${reason}
    </div>
    <br />
    <div style="border-width: 1px; border-color: #626262; border-style: solid none none none;">
      <a href="mailto:${email}">${email}</a>.
    </div>`

  const emailPayload = {
    subject: 'Access request for the BC Telemetry Warehouse',
    priority: 'normal',
    encoding: 'utf-8',
    bodyType: 'html',
    body: emailMessage,
    from: chesFromEmail,
    to: chesToEmail,
    cc: [],
    bcc: [],
    delayTS: 0
  }

  console.log('handleUserAccessRequest() -- POSTing to CHES', emailPayload);
  axios.post(
    chesApiUrl,
    emailPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  ).then((response) => {
    console.log('handleUserAccessReques() -- OK')
    res.status(200).send('Email was sent');
  }).catch((error) => {
    console.log('handleUserAccessReques() -- ERROR', error)
    res.status(500).send('Email failed');
  })
};

/* ## denied
  The route to the denied service page
  TODO: Deprecate as all remaining traffic goes to React.
*/
const denied = function (req, res) {
  res.render('denied', req);
}

/* ## devServerRedirect
  Redirect traffic to the React dev server 
*/
const devServerRedirect = function (_, res) {
  res.redirect('locahost:1111');
}

// use enhanced logging in non-production environments
const logger = isProd ? 'combined' : 'dev';

// Server configuration
var app = express()
  .use(helmet())
  .use(cors())
  .use(morgan(logger))
  .use(express.json({ limit: '50mb' }))
  .use(express.urlencoded({ limit: '50mb', extended: true }))
  .use(expressSession(session))
  .use(keycloak.middleware())
  .use(gardenGate) // Keycloak Gate
  .get('/denied', denied);

// Use keycloak authentication only in Production
if (isProd) {
  app
    .get('/api/session-info', retrieveSessionInfo)
    .post('/onboarding', keycloak.protect(), handleUserAccessRequest)
    .all('*', keycloak.protect(), pageHandler);
} else {
  app
    .post('/onboarding', handleUserAccessRequest)
    .post('/api/import-csv', upload.single('csv'), pageHandler)
    .post('/api/import-xml', upload.array('xml'), pageHandler)
    .post('/api/:endpoint', proxyApi);
}
if (isProd) {
  app
    .get('/', keycloak.protect(), pageHandler)
    // .get('/api/session-info', retrieveSessionInfo)
    .get('/api/:endpoint', keycloak.protect(), proxyApi)
    .get('/api/:endpoint/:endpointId', keycloak.protect(), proxyApi)
    // bulk file import handlers
    .post('/api/import-csv', upload.single('csv'), keycloak.protect(), pageHandler)
    .post('/api/import-xml', upload.array('xml'), keycloak.protect(), pageHandler)
    .post('/api/:endpoint', keycloak.protect(), proxyApi)
    // delete handlers
    .delete('/api/:endpoint/:endpointId', keycloak.protect(), proxyApi);
}

// handle static assets 
app
  .use(express['static'](path.join(__dirname, '../../react/build')));

// pass all remaning requests (i.e. not defined in Express) to React
if (isProd) {
  console.log('express() -- passing page request to React')
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '../../../react/build/index.html'));
  });
} else {
  app
    .get('*', devServerRedirect);
}

// For testing development purposes
// if (!isProd) app.get('*', devServerRedirect);

// start Express server on port 8080
http.createServer(app).listen(8080);