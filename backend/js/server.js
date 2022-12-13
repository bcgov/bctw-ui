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
const path = require("path");
const { response } = require("express");

const sessionSalt = process.env.BCTW_SESSION_SALT;

const isProd = process.env.NODE_ENV === "production" ? true : false;
const isPublic = process.env.KEYCLOAK_CLIENT_TYPE === "public" ? true : false;
const apiHost = `http://${process.env.BCTW_API_HOST}`;
const apiPort = process.env.BCTW_API_PORT;

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
  res.status(200).send(sessionInfo);
};

// TODO: move into separate package?
// Keycloak-protected service for proxying calls to the API host (browser -> proxy -> API)
const proxyApi = function (req, res, next) {
  // URL of the endpoint being targeted
  const endpoint = req.params.endpoint;
  // create a string of key-value pairs from the parameters passed
  const parameters = Object.keys(req.query)
    .map((key) => {
      return `${key}=${req.query[key]}`;
    })
    .join("&");

  let url;
  if (isProd) {
    // split out the domain and username of logged-in user
    const { domain, keycloak_guid } = getProperties(
      req.kauth.grant.access_token.content
    );

    // build up URL from ENV variables and targeted endpoint
    url = `${apiHost}:${apiPort}/${endpoint}`;

    // if endpointId is known, append to URL
    if (req.params.endpointId) {
      url += `/${req.params.endpointId}`;
    }
    // add parameters and username to URL
    url = appendQueryToUrl(url, parameters);
    url = appendQueryToUrl(url, `${domain}=${keycloak_guid}`);
  } else {
    // connect to API without using Keycloak authentication
    url = `${apiHost}:${apiPort}/${endpoint}?${parameters}`;
  }

  const errHandler = (err) => {
    const { response } = err;
    res.status(response.status).json({ error: response.data });
  };

  const successHandler = (response) => {
    return res.json(response.data);
  };

  if (req.method === "POST") {
    const { file, files } = req;
    if (file || files) {
      // depending on the type of file uploaded
      // create a new formdata object to pass on to the server
      const { form, config } = file ? handleFile(file) : handleFiles(files);
      // console.log(JSON.stringify(form, null, 2));
      axios.post(url, form, config).then(successHandler).catch(errHandler);
    } else {
      axios.post(url, req.body).then(successHandler).catch(errHandler);
    }
  } else if (req.method === "DELETE") {
    axios.delete(url).then(successHandler).catch(url);
  }
  // handle get
  else {
    // get-template should be retrieved as octet-stream, not JSON
    const isTemplateEndpoint = endpoint === "get-template";
    if (isTemplateEndpoint) {
      // var b64string = "iVBORw0KGgoAAAANSUhEUgAAABEAAAAOCAMAAAD+MweGAAADAFBMVEUAAAAAAFUAAKoAAP8AJAAAJFUAJKoAJP8ASQAASVUASaoASf8AbQAAbVUAbaoAbf8AkgAAklUAkqoAkv8AtgAAtlUAtqoAtv8A2wAA21UA26oA2/8A/wAA/1UA/6oA//8kAAAkAFUkAKokAP8kJAAkJFUkJKokJP8kSQAkSVUkSaokSf8kbQAkbVUkbaokbf8kkgAkklUkkqokkv8ktgAktlUktqoktv8k2wAk21Uk26ok2/8k/wAk/1Uk/6ok//9JAABJAFVJAKpJAP9JJABJJFVJJKpJJP9JSQBJSVVJSapJSf9JbQBJbVVJbapJbf9JkgBJklVJkqpJkv9JtgBJtlVJtqpJtv9J2wBJ21VJ26pJ2/9J/wBJ/1VJ/6pJ//9tAABtAFVtAKptAP9tJABtJFVtJKptJP9tSQBtSVVtSaptSf9tbQBtbVVtbaptbf9tkgBtklVtkqptkv9ttgBttlVttqpttv9t2wBt21Vt26pt2/9t/wBt/1Vt/6pt//+SAACSAFWSAKqSAP+SJACSJFWSJKqSJP+SSQCSSVWSSaqSSf+SbQCSbVWSbaqSbf+SkgCSklWSkqqSkv+StgCStlWStqqStv+S2wCS21WS26qS2/+S/wCS/1WS/6qS//+2AAC2AFW2AKq2AP+2JAC2JFW2JKq2JP+2SQC2SVW2Saq2Sf+2bQC2bVW2baq2bf+2kgC2klW2kqq2kv+2tgC2tlW2tqq2tv+22wC221W226q22/+2/wC2/1W2/6q2///bAADbAFXbAKrbAP/bJADbJFXbJKrbJP/bSQDbSVXbSarbSf/bbQDbbVXbbarbbf/bkgDbklXbkqrbkv/btgDbtlXbtqrbtv/b2wDb21Xb26rb2//b/wDb/1Xb/6rb////AAD/AFX/AKr/AP//JAD/JFX/JKr/JP//SQD/SVX/Sar/Sf//bQD/bVX/bar/bf//kgD/klX/kqr/kv//tgD/tlX/tqr/tv//2wD/21X/26r/2////wD//1X//6r////qm24uAAAA1ElEQVR42h1PMW4CQQwc73mlFJGCQChFIp0Rh0RBGV5AFUXKC/KPfCFdqryEgoJ8IX0KEF64q0PPnow3jT2WxzNj+gAgAGfvvDdCQIHoSnGYcGDE2nH92DoRqTYJ2bTcsKgqhIi47VdgAWNmwFSFA1UAAT2sSFcnq8a3x/zkkJrhaHT3N+hD3aH7ZuabGHX7bsSMhxwTJLr3evf1e0nBVcwmqcTZuatKoJaB7dSHjTZdM0G1HBTWefly//q2EB7/BEvk5vmzeQaJ7/xKPImpzv8/s4grhAxHl0DsqGUAAAAASUVORK5CYII=";
      // console.log("[LOG] b64string = " + b64string);
      // var buf = Buffer.from(b64string, 'base64');
      // res.set('Content-Type', 'image/png');
      // res.send(buf);
      axios({
        method: "get",
        url: url,
        responseType: "arraybuffer",
      }).then(function (response) {
        res.set(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.send(Buffer.from(response.data));
      });
    } else {
      axios.get(url).then(successHandler).catch(errHandler);
    }
  }
};

/**
 * csv files can only be imported one at a time
 */
const handleFile = function (file) {
  if (file) {
    const form = new formData();
    form.append("csv", file.buffer, file.originalname);
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
  res.redirect("locahost:1111");
};

// use enhanced logging in non-production environments
const logger = isProd ? "combined" : "dev";

// Server configuration
var app = express()
  .use(helmet())
  .use(cors())
  .use(morgan(logger))
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
    .post("/api/import-csv", upload.single("csv"), pageHandler)
    .post("/api/import-xml", upload.array("xml"), pageHandler)
    .post("/api/:endpoint", proxyApi);
}
if (isProd) {
  app
    .get("/", keycloak.protect(), pageHandler)
    .get("/api/get-template", keycloak.protect())
    // .get('/api/session-info', retrieveSessionInfo)
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

// For testing development purposes
// if (!isProd) app.get('*', devServerRedirect);

// start Express server on port 8080
http.createServer(app).listen(8080);
