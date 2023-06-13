require("dotenv").config();
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const expressSession = require("express-session");
const helmet = require("helmet");
const formData = require("form-data");
const http = require("http");
const keycloakConnect = require("keycloak-connect");
const morgan = require("morgan");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const path = require("path");
const cbEndpoint = "cb";
const sessionSalt = process.env.BCTW_SESSION_SALT;
const api = axios.create({ withCredentials: true });
const isProd = process.env.NODE_ENV === "production" ? true : false;
const isPublic = process.env.KEYCLOAK_CLIENT_TYPE === "public" ? true : false;
const apiHost = `http://${process.env.BCTW_API_HOST}`;
const apiPort = process.env.BCTW_API_PORT;
const cbApi = process.env.CRITTERBASE_API;
const cbApiKey = process.env.CRITTERBASE_API_KEY;

console.table({ isProd, isPublic, apiHost, apiPort, sessionSalt, cbApi });
// use Express memory store for session and Keycloak object
var memoryStore = new expressSession.MemoryStore();

// multer configuration for handling bulk imports
const storage = multer.memoryStorage();
const upload = multer({ storage });

// create a Keycloak config object (deprecates use of keycloak.json)
// see: https://www.keycloak.org/docs/latest/securing_apps/index.html#_nodejs_adapter
var keyCloakConfig = {
  authServerUrl: process.env.KEYCLOAK_SERVER_URL,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  secret: process.env.KEYCLOAK_CLIENT_SECRET,
  resource: process.env.KEYCLOAK_CLIENT_ID,
  publicClient: isPublic,
  realm: process.env.KEYCLOAK_REALM,
};

// instantiate Keycloak Node.js adapter, passing in configuration
var keycloak = new keycloakConnect(
  {
    store: memoryStore,
  },
  keyCloakConfig
);

// set up the session
var session = {
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1,000 days
    secure: false,
  },
  resave: false,
  saveUninitialized: true,
  secret: sessionSalt,
  store: memoryStore,
  user: undefined,
};

// TODO: move into separate package?
// creates a well-formed URL with query string given a parameter
const appendQueryToUrl = (url, parameter) => {
  if (!parameter) return url;
  return url.includes("?")
    ? (url += `&${parameter}`)
    : (url += `?${parameter}`);
};

// TODO: move into separate package?
// split out the username and  domain ('username@idir' or 'username@bceid-business') from Keycloak preferred_username
const getProperties = (ob) => {
  const domain = ob.idir_user_guid ? "idir" : "bceid";
  const isIdir = domain === "idir";
  const keycloak_guid = isIdir ? ob.idir_user_guid : ob.bceid_business_guid;
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
  if (!isProd) {
    return res
      .status(500)
      .send("Keycloak session info available: not PROD environment");
  }
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
  // req.session.user = sessionInfo;
  res.status(200).send(sessionInfo);
};

// TODO: move into separate package?
// Keycloak-protected service for proxying calls to the API host (browser -> proxy -> API)
const proxyApi = function (req, res, next) {
  // console.log(req.headers);
  // URL of the endpoint being targeted
  const endpoint = req.params.endpoint;
  const cbEndpoint = req.params.cbEndpoint;
  const options = {
    headers: { ...req.headers, "api-key": cbApiKey },
    params: req.query,
  };
  if (req.session.user) {
    res.set("user-id", req.session.user.critterbase_user_id);
    res.set("keycloak-uuid", req.session.user.keycloak_uuid);
  }
  const path = req.path.replace("/api/", "");
  let url;
  if (isProd) {
    // split out the domain and username of logged-in user
    const { domain, keycloak_guid } = getProperties(
      req.kauth.grant.access_token.content
    );

    url = `${apiHost}:${apiPort}/${path}`;

    // add parameters and username to URL
    url = appendQueryToUrl(url, `${domain}=${keycloak_guid}`);
  } else {
    // connect to API without using Keycloak authentication
    url = `${apiHost}:${apiPort}/${path}?${parameters}`;
  }

  const errHandler = (err) => {
    const { response } = err;
    res.status(response?.status ? response.status : 400).json({
      error: response?.data ? response.data : "unknown proxyApi error",
    });
  };

  const successHandler = (response) => {
    if (endpoint === "get-user") {
      req.session.user = {
        keycloak_uuid: response.data.keycloak_guid,
        critterbase_user_id: response.data.critterbase_user_id,
      };
    }
    return res.json(response.data);
  };

  if (req.method === "POST") {
    const { file, files } = req;
    if (file || files) {
      // depending on the type of file uploaded
      // create a new formdata object to pass on to the server
      const { form, config } = file ? handleFile(file) : handleFiles(files);
      // console.log(JSON.stringify(form, null, 2));
      api
        .post(url, form, { ...options, ...config })
        .then(successHandler)
        .catch(errHandler);
    } else {
      api.post(url, req.body, options).then(successHandler).catch(errHandler);
    }
  } else if (req.method === "DELETE") {
    api.delete(url, options).then(successHandler).catch(url);
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
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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

/* ## gardenGate
  Check that the user is authenticated before continuing.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
*/
const gardenGate = function (req, res, next) {
  if (keycloak.checkSso()) {
    return next();
  } else {
    console.log("User NOT authenticated; denying access");
    return res
      .status(404)
      .send("<p>Error: You must be authenticated to use this application.</p>");
  }
};

/* ## notFound
  Catch-all router for any request that does not have an endpoint defined.
  @param req {object} Node/Express request object
  @param res {object} Node/Express response object
 */
const notFound = function (req, res) {
  return res
    .status(404)
    .send("<p>Express server.js says: : Sorry, but you must be lost.</p>");
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

/* ## denied
  The route to the denied service page
  TODO: Deprecate as all remaining traffic goes to React.
*/
const denied = function (req, res) {
  res.render("denied", req);
};

/* ## devServerRedirect
  Redirect traffic to the React dev server 
*/
const devServerRedirect = function (_, res) {
  res.redirect("localhost:1111");
};

// use enhanced logging in non-production environments
const logger = isProd ? "combined" : "dev";
// Server configuration
var app = express()
  .use(helmet())
  .use(cors({ credentials: true }))
  .use(cookieParser(sessionSalt))
  // .use(morgan("dev"))
  .use(express.json({ limit: "50mb" }))
  .use(express.urlencoded({ limit: "50mb", extended: true }))
  .use(expressSession(session))
  .use(keycloak.middleware())
  .use(gardenGate) // Keycloak Gate
  .get("/denied", denied);

// Use keycloak authentication only in Production
if (isProd) {
  app
    .get("/api/session-info", retrieveSessionInfo)
    .all("*", keycloak.protect(), pageHandler);
} else {
  app
    .post("/api/import-xlsx", upload.single("validated-file"), pageHandler)
    .post("/api/import-csv", upload.single("csv"), pageHandler)
    .post("/api/import-xml", upload.array("xml"), pageHandler)

    //Critterbase Post requests
    .post("/api/cb/:cbEndpoint", proxyApi)
    .post("/api/cb/:cbEndpoint/*", proxyApi)

    .post("/api/:endpoint", proxyApi);
}
if (isProd) {
  app
    .get("/", keycloak.protect(), pageHandler)
    .get("/api/get-template", keycloak.protect())

    //Critterbase Get requests
    .get("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
    .get("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)

    .get("/api/:endpoint", keycloak.protect(), proxyApi)
    .get("/api/:endpoint/:endpointId", keycloak.protect(), proxyApi)
    // bulk file import handlers
    .post(
      "/api/import-xlsx",
      upload.single("validated-file"),
      keycloak.protect(),
      pageHandler
    )
    .post(
      "/api/import-csv",
      upload.single("csv"),
      keycloak.protect(),
      pageHandler
    )
    .post(
      "/api/import-xml",
      upload.array("xml"),
      keycloak.protect(),
      pageHandler
    )
    //Critterbase Post requests
    .post("/api/cb/:cbEndpoint", keycloak.protect(), proxyApi)
    .post("/api/cb/:cbEndpoint/*", keycloak.protect(), proxyApi)

    .post("/api/:endpoint", keycloak.protect(), proxyApi)
    // delete handlers
    .delete("/api/:endpoint/:endpointId", keycloak.protect(), proxyApi);
}

// handle static assets
app.use(express["static"](path.join(__dirname, "../../react/build")));

// pass all remaning requests (i.e. not defined in Express) to React
if (isProd) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "../../../react/build/index.html"));
  });
} else {
  app.get("*", devServerRedirect);
}

// start Express server on port 8080
http.createServer(app).listen(8080);
