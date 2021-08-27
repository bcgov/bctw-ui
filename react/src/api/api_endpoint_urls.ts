/**
 * some endpoint urls are used in more than one api.ts file
*/

const importCSVEndpoint = 'import-csv';
const importXMLEndpoint = 'import-xml';
const exportEndpoint = 'export';
const getCollarAssignmentHistoryEndpoint = 'get-assignment-history';
const linkCollarEndpoint = 'change-animal-collar';
const upsertCritterEndpoint = 'upsert-animal';
const upsertDeviceEndpoint = 'upsert-collar';
const upsertAlertEndpoint = 'update-user-alert';

export {
  importCSVEndpoint,
  importXMLEndpoint,
  exportEndpoint,
  getCollarAssignmentHistoryEndpoint,
  linkCollarEndpoint,
  upsertAlertEndpoint,
  upsertCritterEndpoint,
  upsertDeviceEndpoint,
}