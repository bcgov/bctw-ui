# How to run keycloak / proxy api locally

- Simulates the live production application locally
- Will have to log in via idir / keycloak to gain access to the application
- Useful for debugging keycloak or proxy api endpoint issues

# 1. Add .env file and include

NODE_ENV=production
BCTW_API_HOST=localhost
BCTW_API_PORT=3000
BCTW_SESSION_SALT=<find in openshift secrets for UI pod>

KEYCLOAK_CLIENT_TYPE=confidential
KEYCLOAK_REALM=standard
KEYCLOAK_SERVER_URL=https://dev.loginproxy.gov.bc.ca/auth
KEYCLOAK_CLIENT_ID=bc-telemetry-warehouse-3766
KEYCLOAK_CLIENT_SECRET=<find in openshift secrets for UI pod>

# 2. In bctw/bctw-ui/react run `npm run build'

- The keycloak / proxy api server uses the most recent build from the builds directory
- Without this step the application will be behind the current version locally

# 3. Run both API / UI servers

- bctw/bctw-api/bctw-api `npm run start:dev`
- bctw/bctw-ui/react ` npm run start`

# 4. Run the proxy / keycloak server

- bctw/bctw-ui/backend `npm run start`

# 5. http://localhost:8080
