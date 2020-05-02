/* Bare bones static file server */
const fs = require('fs');
const pg = require('pg');
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const protect = require('@risingstack/protect');
const expressSession = require('express-session');
const keycloakConnect = require('keycloak-connect');

const sessionSalt = process.env.BCTW_SESSION_SALT;

const isProd = process.env.NODE_ENV === 'prod' ? true : false;
const isLiveData = process.env.BCTW_IS_LIVE_DATA;

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

var pgPool = new pg.Pool({
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  host: isProd ? process.env.POSTGRES_SERVER_HOST : 'localhost',
  port: isProd ? process.env.POSTGRES_SERVER_PORT : 5432,
  max: 10
});

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

/* ## getFileCollars
  Get collar data from the test file
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
  @param next {function} Node/Express function for flow control
 */
const getFileCollars = function (req, res, next) {
  console.log("Retrieving collar data from local file on server.");
  fs.readFile(__dirname + '/../../data/lotek_plusx_merge_light.json', (err,data) => {
    if (err) {
      return res.status(500).send('Failed to read sample GeoJSON file');
    }
    res.send(data.toString());
  });
};

/* ## getDBCollars
  Get collar data from the database. Returns GeoJSON through Express.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
  @param next {function} Node/Express function for flow control
 */
const getDBCollars = function (req, res, next) {
  console.log("Retrieving collar data from database.");
  const sql = `
    SELECT row_to_json(fc)
     FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
     FROM (
      SELECT 'Feature' As type,
        ST_AsGeoJSON(lg.geometry)::json As geometry,
        row_to_json((
          animal_id,
          collar_id,
          local_timestamp
        )) As properties
       FROM vendor_data_merge As lg
       order by local_timestamp desc
       limit 2000
    ) As f )  As fc;
  `;
  const done = function (err,data) {
    if (err) {
      return res.status(500).send('Failed to query database');
    }
    res.send(data.rows[0].row_to_json);
  };
  pgPool.query(sql,done);
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
  .use(express['static']('frontend/www'))
  .use(express['static']('frontend/dist'))
  .set('view engine', 'pug')
  .set('views', 'backend/pug')
  .get('/get-collars',(isLiveData === 'true') ? getDBCollars : getFileCollars)
  .get('*', notFound);

http.createServer(app).listen(8080);