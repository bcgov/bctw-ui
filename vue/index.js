const path = require('path');
/* # index.js
 * Entry point for BCTW application
 * All logic is contained in lib/ls/index.ls
 */
require('livescript');
exports.handler = require(path.join(__dirname, '../backend/js/server.js'));
