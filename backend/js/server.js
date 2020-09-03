/* Bare bones static file server */
//const fs = require('fs');
//const pg = require('pg');
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const helmet = require('helmet');
const needle = require('needle');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const keycloakConnect = require('keycloak-connect');

const sessionSalt = process.env.BCTW_SESSION_SALT;

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const apiHost = process.env.BCTW_API_HOST;
const apiPort = process.env.BCTW_API_PORT;

var memoryStore = new expressSession.MemoryStore();

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

/* ## proxyApi
  The api is not exposed publicly. This service is protected
  by Keycloak. So forward all authenticated traffic.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
  @param next {function} Node/Express function for flow control
 */
const proxyApi = function (req, res, next) {
  const endpoint = req.params.endpoint;
  const query = Object.keys(req.query).map( (key) => {
    return `${key}=${req.query[key]}`
  }).join('&');
  const url = `${apiHost}:${apiPort}/${endpoint}?${query}`;
  console.log(url);
  // Right now it's just a get
  needle(url,(err,_,body) => {
    if (err) {
      console.error("Error communicating with the API: ",err);
      return res.status(500).json({error: err});
    }

    res.json(body);
  })
};

/* ## gardenGate
  Check that the user is authenticated before continuing.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
*/
const gardenGate = function (req, res, next) {
  if (keycloak.checkSso()) {
    return next();
  } else {
    console.log("User NOT authenticated; denying access")
    return res.status(404).send('<p>Error: You must be authenticated to use this application.</p>');
  }
};

/* ## notFound
  Catch-all router for any request that does not have an endpoint defined.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
 */
const notFound = function (req, res) {
  return res.sendStatus(404);
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

// use enhanced logging in non-production environments
const logger = isProd ? 'combined' : 'dev';

const authenticate = function (req,_,next) {
  console.log("access_token:",req.kauth.grant.access_token);
  next();
};

var app = express()
  .use(helmet())
  .use(cors())
  .use(morgan(logger))
  .use(bodyParser.json({
    limit: '50mb'
  }))
  .use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }))
  .use(expressSession(session))
  .use(keycloak.middleware())
  .use(gardenGate)
  .use(authenticate)
  .get('/', keycloak.protect(), pageHandler)
  .get('/api/:endpoint', keycloak.protect(), proxyApi)
  // .get('/api/:endpoint', proxyApi)
  // .get('/', pageHandler)
  // .use(compression())
  .use(express['static']('frontend/www'))
  .use(express['static']('frontend/dist'))
  .set('view engine', 'pug')
  .set('views', 'backend/pug')
  .get('*', notFound);

http.createServer(app).listen(8080);