/* 'Bare bones'.strike() static file server */
const pg = require('pg');
const pug = require('pug');
const axios = require('axios');
const path = require('path')
const cors = require('cors');
const FormData = require('form-data');
const http = require('http');
const morgan = require('morgan');
const multer = require('multer');
const helmet = require('helmet');
const express = require('express');
const expressSession = require('express-session');
const keycloakConnect = require('keycloak-connect');

const sessionSalt = process.env.BCTW_SESSION_SALT;

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const isTest = process.env.TEST === 'true';
const apiHost = `http://${process.env.BCTW_API_HOST}`;
const apiPort = process.env.BCTW_API_PORT;

// Set up the database pool
const pgPool = new pg.Pool({
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_SERVER_HOST,
  port: process.env.POSTGRES_SERVER_PORT,
  max: 10,
});

var memoryStore = new expressSession.MemoryStore();

const storage = multer.memoryStorage()
const upload = multer({ storage });

// Keycloak config object (deprecates use of keycloak.json)
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

const appendQueryToUrl = (url, query) => {
  if (!query) return url;
  return url.includes('?') ? url += `&${query}` : url += `?${query}`;
};

/**
 * the username and domain (ie whether the user authenticated with a BCEID vs an IDIR) 
 * are stored in the keycloak object's @param preferred_username property. 
 */
const splitCredentials = (sessionObject) => {
  const credentials = sessionObject.preferred_username.split('@');
  if (!credentials.length) {
    return {}
  }
  return { user: credentials[0], domain: credentials[1] };
}

/**
 * endpoint that returns keycloak session info
*/
const retrieveSessionInfo = function (req, res, next) {
  if (!isProd) {
    return res.status(500).send('not in production, no session info available');
  }
  const data = req.kauth.grant.access_token.content;
  if (!data) {
    return res.status(500).send('unable to retrieve session info');
  }
  const { family_name, given_name, email } = data;
  const ret = {
    email,
    family_name,
    given_name,
    ...splitCredentials(data)
  }
  res.status(200).send(ret);
}

/* ## proxyApi
  The api is not exposed publicly. This service is protected
  by Keycloak. So forward all authenticated traffic.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
  @param next {function} Node/Express function for flow control
 */
const proxyApi = function (req, res, next) {
  const endpoint = req.params.endpoint; // The url

  // The parameter string
  const query = Object.keys(req.query).map((key) => {
    return `${key}=${req.query[key]}`;
  }).join('&');

  // The domain and username
  let url;
  if (isProd) {
    const { domain, user } = splitCredentials(req.kauth.grant.access_token.content);
    url = `${apiHost}:${apiPort}/${endpoint}`;
    if (req.params.endpointId) {
      url += `/${req.params.endpointId}`;
    }
    url = appendQueryToUrl(url, query);
    url = appendQueryToUrl(url, `${domain}=${user}`)
  } else {
    url = `${apiHost}:${apiPort}/${endpoint}?${query}&idir=user`;
  }

  // console.log(`url: ${url}, type: ${req.method}`);
  const errHandler = (err) => {
    console.error(err.response);
    res.status(500).json({ error: err.response.data });
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
    const form = new FormData();
    form.append('csv', file.buffer, file.originalname);
    return { form, config: { headers: form.getHeaders() } }
  }
}

/*
  * multiple xml files can be processed
*/
const handleFiles = function (files) {
  if (files && files.length) {
    const form = new FormData();
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
  console.log('pageHandler() -- CALLED');
  return next();
};

/**
 * # onboardingRedirect
 * If you get here you have a valid IDIR.
 * Check if the user is registerd in the database.
 * If yes.... Pass through.
 * Else... Direct to the onboarding page.
 * @param req {object} Express request object
 * @param res {object} Express response object
 * @param next {function} Express function to continue on
 */
const onboardingRedirect = async (req, res, next) => {

  console.log('onboardingRedirect() -- START')
  // Collect all user data from the keycloak object
  const data = req.kauth.grant.access_token.content;
//  console.log('onboardingRedirect() -- data:', data)
  const { user, domain } = splitCredentials(data);
  console.log('onboardingRedirect() -- user:', user)
  // TODO: Get credential info from the 'getUser() function'
  const email = data.email;
  const givenName = data.given_name;
  const familyName = data.family_name;

  // Get a list of all allowed users
  const sql = 'select idir from bctw.user'
  const client = await pgPool.connect();
  const result = await client.query(sql);
  const idirs = result.rows.map((row) => row.idir);
//  console.log('onboardingRedirect() -- Registered IDIRs in BCTW:', idirs)
  // Is the current user registered: Boolean
  const registered = (idirs.includes(user)) ? true : false;
  console.log('onboardingRedirect() -- User is registered?', registered);

  console.log('onboardingRedirect() -- URL requested: ', req.url);
  if (registered) { // If registered
    console.log('onboardingRedirect() -- User is registered; passing through')
    next(); // pass through
  } else { // Otherwise redirect to the onboarding page
    if (req.url.match(/\/onboarding/)) {
      console.log('onboardingRedirect() -- Onboarding URL requested; passing through')
      next(); // already heading to onboarding so pass through
    } else {
      console.log('onboardingRedirect() -- User is NOT registered; directing to /onboarding')
      res.redirect('/onboarding');
    }
    console.log('onboardingRedirect() -- Query parameters supplied: ', req.query.onboarding)
    // console.log('url:', req.url)
  }
  client.release(); // Release database connection
  console.log('onboardingRedirect() -- END')
};

const onboardingAccess = async (req, res) => {
  // This data will be inserted into the email
  // TODO: Get the below info from Keycloak. (i.e. no longer passed through body)
  const {
    user,
    domain,
    email,
    firstName,
    lastName,
    accessType,
    populationUnit,
    projectManager,
    projectName,
    projectRole,
    reason,
    region,
    species,
    textMessageNumber,
  } = req.body;

  const data = req.kauth.grant.access_token.content;

  // TODO: This has to be tested in dev unfortunately
  console.log('keycloak data', data);
  console.log('sent data', req.body);

  // Get all the environment variable dependencies
  const tokenUrl = `${process.env.BCTW_CHES_AUTH_URL}/protocol/openid-connect/token`;
  const apiUrl = `${process.env.BCTW_CHES_API_URL}/api/v1/email`;
  const username = process.env.BCTW_CHES_USERNAME;
  const password = process.env.BCTW_CHES_PASSWORD;
  const fromEmail = process.env.BCTW_CHES_FROM_EMAIL;
  const toEmail = process.env.BCTW_CHES_TO_EMAIL.split(',');

  // Create the authorization hash
  const prehash = Buffer.from(`${username}:${password}`, 'utf8')
    .toString('base64');
  const hash = `Basic ${prehash}`;

  const tokenParcel = await axios.post(
    tokenUrl,
    'grant_type=client_credentials',
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": hash
      }
    });

  const pretoken = tokenParcel.data.access_token;
  if (!pretoken) return res.status(500).send('Authentication failed');
  const token = `Bearer ${pretoken}`;

  const emailMessage = `
    <div>
      Access to the BC Telemetry Warehouse has be requested by
      <b>${domain}</b> user <b>${firstName} ${lastName}</b>. Username is <b>${user}</b>.
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
    </div>
  `

  const emailPayload = {
    subject: 'Access request for the BC Telemetry Warehouse',
    priority: 'normal',
    encoding: 'utf-8',
    bodyType: 'html',
    body: emailMessage,
    from: fromEmail,
    to: toEmail,
    cc: [],
    bcc: [],
    delayTS: 0
  }

  axios.post(
    apiUrl,
    emailPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  ).then((response) => {
    res.status(200).send('Email was sent');
  }).catch((error) => {
    res.status(500).send('Email failed');
  })
};

/* ## denied
  The route to the denied service page
  TODO: Deprecate as all remaining traffic goes to React.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
*/
const denied = function (req, res) {
  res.render('denied', req);
}

/* ## devServerRedirect
  Redirect traffic to the React dev server 
  @param _ {object} Node/Express request object
  @param res {object} Node/Express response object
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

if (isProd) {
  console.log('this is prod');
  app
    .post('/onboarding', keycloak.protect(), onboardingAccess)
    .all('*', keycloak.protect(), onboardingRedirect);
} else {
  console.log('this is NOT prod!!!!!');
  app
    .post('/onboarding', onboardingAccess);
}

console.log('************* This is new!!! ***************');

if (isTest) {
  console.log('express() -- isTest?', isTest);
  app
    .post('/api/import-csv', upload.single('csv'), pageHandler)
    .post('/api/import-xml', upload.array('xml'), pageHandler)
    .post('/api/:endpoint', proxyApi);
  // Use keycloak authentication only in Production
} else if (isProd) {
  console.log('express() -- isProd?', isProd);
  app
    .get('/', keycloak.protect(), pageHandler)
    .get('/api/session-info', retrieveSessionInfo)
    .get('/api/:endpoint', keycloak.protect(), proxyApi)
    .get('/api/:endpoint/:endpointId', keycloak.protect(), proxyApi)
    // bulk file import handlers
    .post('/api/import-csv', upload.single('csv'), keycloak.protect(), pageHandler)
    .post('/api/import-xml', upload.array('xml'), keycloak.protect(), pageHandler)
    .post('/api/:endpoint', keycloak.protect(), proxyApi)
    // delete handlers
    .delete('/api/:endpoint/:endpointId', keycloak.protect(), proxyApi);
} else {
  console.log('express() -- neither isTest or IsProd')
  app
    .get('/api/:endpoint', proxyApi)
    .get('/', pageHandler);
}

// handle static assets 
app
  .use(express['static'](path.join(__dirname, '../../react/build')));

// pass all remaning requests (i.e. not defined in Express) to React
if (isProd) {
  console.log('express() -- passing page request to React')
  app.get('*', (req, res) => {
    // XXX: This is causing all assets to get the index.html
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