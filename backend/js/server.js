/* Bare bones static file server */
const fs = require('fs');
const pg = require('pg');
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const helmet = require('helmet');
const needle = require('needle');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const protect = require('@risingstack/protect');
const expressSession = require('express-session');
const keycloakConnect = require('keycloak-connect');

const sessionSalt = process.env.BCTW_SESSION_SALT;

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const apiHost = process.env.BCTW_API_HOST;
const apiPort = process.env.BCTW_API_PORT;

var memoryStore = new expressSession.MemoryStore();
var keycloak = new keycloakConnect({ store: memoryStore });

var session = {
  secret: sessionSalt,
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false
  }
};

/* ## proxyApi
  The api is not exposed publicly. This service is protected
  by keycloak. So forward all authenticated traffic.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
  @param next {function} Node/Express function for flow control
 */
const proxyApi = function (req, res, next) {
  const endpoint = req.params.endpoint;
  const url = `${apiHost}:${apiPort}/${endpoint}`;
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

// use enhanced logging in non-prod environments
const logger = isProd ? 'combined' : 'dev';

var app = express()
  .use(helmet())
  .use(cors())
  .use(protect.express.sqlInjection({
    body: true,
    loggerFunction: console.error
  }))
  .use(morgan(logger))
  .use(compression())
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
  .get('/', keycloak.protect(), pageHandler)
  .get('/api/:endpoint', keycloak.protect(), proxyApi)
  // .get('/api/:endpoint', proxyApi)
  .use(express['static']('frontend/www'))
  .use(express['static']('frontend/dist'))
  .set('view engine', 'pug')
  .set('views', 'backend/pug')
  .get('*', notFound);

http.createServer(app).listen(8080);