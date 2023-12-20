require("dotenv").config();
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const expressSession = require("express-session");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const formData = require("form-data");
const http = require("http");
const keycloakConnect = require("keycloak-connect");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const MemoryStore = require("memorystore")(expressSession);
const sessionSalt = process.env.BCTW_SESSION_SALT;
const api = axios.create({ withCredentials: true });
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
  user: undefined,
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

// TODO: move into separate package?
// split out the username and  domain ('username@idir' or 'username@bceid-business') from Keycloak preferred_username
const getProperties = (ob) => {
  const domain = ob.idir_user_guid ? "idir" : "bceid";
  const isIdir = domain === "idir";
  const keycloak_guid = isIdir ? ob.idir_user_guid : ob.bceid_user_guid;
  const username = isIdir
    ? ob.idir_username.toLowerCase()
    : ob.bceid_username.toLowerCase();
  return {
    keycloak_guid,
    domain,
    username,
  };
};

// TODO: move into separate package?
// endpoint that returns Keycloak session information
const retrieveSessionInfo = function (req, res, next) {
  // get contents of the current Keycloak access token
  const data = req.kauth.grant.access_token.content;

  if (!data) {
    return res
      .status(500)
      .send("Error: Unable to retrieve Keycloak session information");
  }

  const { family_name, given_name, email } = data;
  const sessionInfo = {
    email,
    family_name,
    given_name,
    ...getProperties(data),
  };
  res.status(200).send(sessionInfo);
};

// Keycloak-protected service for proxying calls to the API host (browser -> proxy -> API)
const proxyApi = function (req, res, next) {
  // URL of the endpoint being targeted
  const endpoint = req.params.endpoint;

  const token = req.kauth.grant.access_token.token;

  let options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: req.query,
  };

  const path = req.path.replace("/api/", "");
  const url = `${apiHost}:${apiPort}/${path}`;

  const errHandler = (err) => {
    const { response } = err;
    res.status(response.status ? response.status : 400).json({
      error: response.data ? response.data : "unknown proxyApi error",
    });
  };

  const successHandler = (response) => {
    if (endpoint === "get-user") {
      req.session.user = {
        "keycloak-uuid": response.data.keycloak_guid,
        "user-id": response.data.critterbase_user_id,
      };
    }
    return res
      .status(response.status ? response.status : 418)
      .json(response.data);
  };

  if (req.method === "POST") {
    const { file, files } = req;
    if (file || files) {
      // depending on the type of file uploaded
      // create a new formdata object to pass on to the server
      const { form, config } = file ? handleFile(file) : handleFiles(files);
      config.headers = { ...config.headers, ...options.headers };
      api
        .post(url, form, { ...config })
        .then(successHandler)
        .catch(errHandler);
      asdfa;
    } else {
      api.post(url, req.body, options).then(successHandler).catch(errHandler);
    }
  } else if (req.method === "DELETE") {
    api.delete(url, options).then(successHandler).catch(url);
  } else if (req.method === "PUT") {
    api.put(url, req.body, options).then(successHandler).catch(url);
  } else if (req.method === "PATCH") {
    api.patch(url, req.body, options).then(successHandler).catch(url);
  }
  // handle get
  else {
    // get-template should be retrieved as octet-stream, not JSON
    const isTemplateEndpoint = endpoint === "get-template";
    if (isTemplateEndpoint) {
      axios({
        method: "get",
        url: url,
        responseType: "arraybuffer",
        ...options,
      }).then(function (response) {
        res.set(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.send(Buffer.from(response.data));
      });
    } else {
      api.get(url, options).then(successHandler).catch(errHandler);
    }
  }
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
  Pass-through function for Express.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
  @param next {function} Node/Express function for flow control
 */
const pageHandler = function (req, res, next) {
  return next();
};

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

  .get("/api/get-template", proxyApi)
  .get("/api/session-info", retrieveSessionInfo)

  //critterbase requests
  .all("/api/cb/:cbEndpoint", proxyApi)
  .all("/api/cb/:cbEndpoint/*", proxyApi)

  .get("/api/:endpoint", proxyApi)
  .get("/api/:endpoint/:endpointId", proxyApi)
  // bulk file import handlers
  .post("/api/import-xlsx", upload.single("validated-file"), proxyApi)
  .post("/api/import-csv", upload.single("csv"), proxyApi)
  .post("/api/import-xml", upload.array("xml"), proxyApi)

  .post("/api/:endpoint", proxyApi)
  // delete handlers
  .delete("/api/:endpoint/:endpointId", proxyApi);

if (isProd) {
  app
    .use(express["static"](path.join(__dirname, "../../react/build")))
    .get("*", (_req, res) => {
      res.sendFile(path.join(__dirname + "../../../react/build/index.html"));
    });
} else {
  app.use(
    "/",
    createProxyMiddleware({
      target: `http://app:${appPort}`,
      ws: true,
    }),
  );
}

// if (isProd) {
//   app;
// } else {
//   app.get("*", (_req, res) => {
//     devServerRedirect(_req, res);
//   });
// }
// // React Redirects
// handle static assets

// .get("*", (_req, res) => {
//   // pass all remaning requests (i.e. not defined in Express) to React
//   isProd
//     ? // direct production requests to react build directory
//       res.sendFile(path.join(__dirname + "../../../react/build/index.html"))
//     : // direct dev requests to development server (hot reloading)
//       //res.sendFile(path.join(__dirname + "../../../react/build/index.html"));
//       devServerRedirect(_req, res);
// });

// Use keycloak authentication only in Production
// if (isProd) {
//   app
//     .get("/api/session-info", retrieveSessionInfo)
//     .all("*", keycloak.protect(), pageHandler);
// } else {
//   app
//     .post("/api/import-xlsx", upload.single("validated-file"), pageHandler)
//     .post("/api/import-csv", upload.single("csv"), pageHandler)
//     .post("/api/import-xml", upload.array("xml"), pageHandler)
//
//     //Critterbase Post requests
//     .post("/api/cb/:cbEndpoint", proxyApi)
//     .post("/api/cb/:cbEndpoint/*", proxyApi)
//
//     .post("/api/:endpoint", proxyApi);
// }
// if (isProd) {
//   app
//     .get("/", keycloak.protect(), pageHandler)
//     .get("/api/get-template", keycloak.protect())
//
//     //Critterbase Get requests
//     .put("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//     .put("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//     .patch("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//     .patch("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//     .get("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//     .get("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//
//     .get("/api/:endpoint", keycloak.protect(), proxyApi)
//     .get("/api/:endpoint/:endpointId", keycloak.protect(), proxyApi)
//     // bulk file import handlers
//     .post(
//       "/api/import-xlsx",
//       upload.single("validated-file"),
//       keycloak.protect(),
//       proxyApi,
//     )
//     .post("/api/import-csv", upload.single("csv"), keycloak.protect(), proxyApi)
//     .post("/api/import-xml", upload.array("xml"), keycloak.protect(), proxyApi)
//     //Critterbase Post requests
//     .post("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//     .post("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//
//     .post("/api/:endpoint", keycloak.protect(), proxyApi)
//     // delete handlers
//     .delete("/api/:endpoint/:endpointId", keycloak.protect(), proxyApi);
// }

// app
//   .get("/api/session-info", retrieveSessionInfo)
//   .all("*", keycloak.protect(), pageHandler)
//   .get("/", keycloak.protect(), pageHandler)
//   .get("/api/get-template", keycloak.protect())
//
//   //Critterbase Requests
//   .put("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//   .put("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//   .patch("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//   .patch("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//   .get("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//   .get("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//   .post("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
//   .post("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)
//
//   .get("/api/:endpoint", keycloak.protect(), proxyApi)
//   .get("/api/:endpoint/:endpointId", keycloak.protect(), proxyApi)
//   // bulk file import handlers
//   .post(
//     "/api/import-xlsx",
//     upload.single("validated-file"),
//     keycloak.protect(),
//     proxyApi,
//   )
//   .post("/api/import-csv", upload.single("csv"), keycloak.protect(), proxyApi)
//   .post("/api/import-xml", upload.array("xml"), keycloak.protect(), proxyApi)
//
//   .post("/api/:endpoint", keycloak.protect(), proxyApi)
//   // delete handlers
//   .delete("/api/:endpoint/:endpointId", keycloak.protect(), proxyApi);

// start Express server on port 8080
http
  .createServer(app)
  .listen(process.env.PROXY_PORT ? process.env.PROXY_PORT : 8080);
