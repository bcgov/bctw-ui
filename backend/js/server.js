require("dotenv").config();
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const expressSession = require("express-session");
const helmet = require("helmet");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const formData = require("form-data");
const http = require("http");
const keycloakConnect = require("keycloak-connect");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const MemoryStore = require("memorystore")(expressSession);
const sessionSalt = process.env.BCTW_SESSION_SALT;
//const api = axios.create({ withCredentials: true });
const isProd = process.env.NODE_ENV === "production" ? true : false;
const isPublic = process.env.KEYCLOAK_CLIENT_TYPE === "public" ? true : false;
const apiHost = `http://${process.env.BCTW_API_HOST}`;
const apiPort = process.env.BCTW_API_PORT;
const appPort = process.env.BCTW_APP_PORT ? process.env.BCTW_APP_PORT : 1111;

console.table({ isProd, isPublic, apiHost, apiPort, sessionSalt });

// multer configuration for handling bulk imports
const storage = multer.memoryStorage();
const upload = multer({ storage });

// set up the session
const session = {
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1,000 days
    secure: false,
  },
  proxy: true,
  store: new MemoryStore({ checkPeriod: 86400000 }),
  resave: false,
  saveUninitialized: true,
  secret: sessionSalt,
};

// instantiate Keycloak Node.js adapter, passing in configuration
const keycloak = new keycloakConnect(
  {
    store: session.store,
  },
  {
    // see: https://www.keycloak.org/docs/latest/securing_apps/index.html#_nodejs_adapter
    authServerUrl: process.env.KEYCLOAK_SERVER_URL,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
    resource: process.env.KEYCLOAK_CLIENT_ID,
    publicClient: isPublic,
    reverseRewriteHostInResponseHeaders: false,
    realm: process.env.KEYCLOAK_REALM,
  },
);

const retrieveSessionInfo = function (req, res, next) {
  // get contents of the current Keycloak access token
  const data = req.kauth.grant.access_token.content;

  if (!data) {
    return res
      .status(500)
      .send("Error: Unable to retrieve Keycloak session information");
  }

  const isIdir = data.idir_user_guid;
  const username = isIdir ? data.idir_username : data.bceid_username;

  const sessionInfo = {
    email: data.email,
    family_name: data.family_name,
    given_name: data.given_name,
    domain: isIdir ? "idir" : "bceid",
    keycloak_guid: isIdir ? data.idir_user_guid : data.bceid_user_guid,
    username: username.toLowerCase(),
  };

  res.status(200).send(sessionInfo);
};

/**
 * csv files can only be imported one at a time
 */
const handleFile = function (file) {
  if (file) {
    const form = new formData();
    form.append(file.fieldname, file.buffer, file.originalname);
    return { form, config: { headers: form.getHeaders() } };
  }
};

/*
 * multiple xml files can be processed
 */
const handleFiles = function (files) {
  if (files && files.length) {
    const form = new formData();
    files.forEach((f) => form.append(f.fieldname, f.buffer, f.originalname));
    // Axios will throw if posting the form as an array, specify the json option to stringify it
    return {
      form,
      config: { headers: form.getHeaders(), options: { json: true } },
    };
  }
};

/**
 * Pass-through function for Express.
 * @param req {object} Node/Express request object
 * @param res {object} Node/Express response object
 * @param next {function} Node/Express function for flow control
 */
const pageHandler = function (req, res, next) {
  return next();
};

/**
 * Proxy for BCTW api
 * @endpoint /api
 * 1. Appends bearer token authorization to each request
 * Note: strips prepended /api from the request ie: /api/get-user -> /get-user
 **/
const BctwApiProxy = createProxyMiddleware(["/api"], {
  target: `${apiHost}:${apiPort}`,
  changeOrigin: true,
  pathRewrite: { "^/api": "" },
  onProxyReq: (proxyReq, req, res) => {
    const { file, files } = req;

    // set bearer authorization for api
    const token = req.kauth.grant.access_token.token;
    proxyReq.setHeader("Authorization", `Bearer ${token}`);

    if (file || files) {
      console.log("FILE IN PROXY");
      // PREVIOUS IMPLEMENTATION FOR FILE UPLOADS.
      // Configure proxy if this is needed
      //
      // const { form, config } = file ? handleFile(file) : handleFiles(files);
      // config.headers = { ...config.headers, ...options.headers };
      // api
      //   .post(url, form, { ...config })
      //   .then(successHandler)
      //   .catch(errHandler);
    }
    /**
     * This fixes the request bodies for POST / PATCH requests in tandem with express.json
     * https://github.com/chimurai/http-proxy-middleware/tree/v2.0.6?tab=readme-ov-file#intercept-and-manipulate-requests
     */
    fixRequestBody(proxyReq, req, res);
  },
});

const DevFrontendProxy = createProxyMiddleware(["!/*.hot-update.json"], {
  target: `http://app:${appPort}`,
  changeOrigin: true,
  ws: true,
});

// Server configuration
var app = express()
  .use(helmet())
  .use(cors())
  .use(cors({ credentials: true }))
  .options("*", cors())
  .use(morgan(isProd ? "combined" : "dev"))
  .use(express.json({ limit: "50mb" }))
  .use(express.urlencoded({ limit: "50mb", extended: true }))
  .use(expressSession(session))
  .use(keycloak.middleware())
  .all("*", keycloak.protect(), pageHandler)
  .get("/api/session-info", retrieveSessionInfo)
  .use(BctwApiProxy);

if (isProd) {
  app
    .use(express["static"](path.join(__dirname, "../../react/build")))
    .get("*", (_req, res) => {
      res.sendFile(path.join(__dirname + "../../../react/build/index.html"));
    });
} else {
  app.use(DevFrontendProxy);
}

// start Express server on port 8080
http
  .createServer(app)
  .listen(process.env.PROXY_PORT ? process.env.PROXY_PORT : 8080);
