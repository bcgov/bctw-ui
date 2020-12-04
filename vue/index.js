/* # index.js
 * Entry point for BCTW application
 * All logic is contained in lib/ls/index.ls
 */
require('livescript');
exports.handler = require(__dirname+'/backend/js/server.js');
