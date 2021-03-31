const CritterStrings = {
  importTitle: 'Bulk Import Animals',
  importText: 'Use this feature to add multiple new animals. Animals cannot be updated from this feature',
  exportTitle: 'Bulk Export Animal Data',
  exportText: '',
  editableProps: ['nickname', 'animal_id', 'wlh_id', 'species', 'region', 'population_unit', 'animal_status', 'juvenile_at_heel'],
  requiredProps: ['animal_id', 'wlh_id', 'species', 'region'],
  collarAssignmentTitle: 'Assign a device',
  assignCollarBtnText: 'assign selected device',
  assignedTableTitle: 'Animals Attached To A Device',
  unassignedTableTitle: 'Animals Without A Device',
  collarRemovalTitle: 'Confirm device unassignment',
  collarRemovalText: 'Are you sure you wish to unassign this device?',

}

const CollarStrings = {
  assignedCollarsTableTitle: 'Assigned Devices',
  availableCollarsTableTitle: 'Unassigned Devices',
  editableProps: ['device_id', 'frequency', 'device_make', 'device_model', 'satellite_network', 'device_status', 'device_type', 'device_deployment_status'],
  selectableProps: ['device_make', 'satellite_network', 'device_status', 'device_type', 'device_deployment_status'],
  requiredProps: ['device_id', 'device_make', 'frequency'],
  exportTitle: 'Bulk Export Device Data',
  exportText: '',
  addCollarTypeTitle: 'Select Device Type',
  addCollarTypeText: 'What type of device would you like to add?',
  addCollarVect: 'Vectronics Device',
  addCollarVHF: 'VHF Device',
  importTitle: 'Bulk Import VHF Devices',
  importText: 'Use this feature to add multiple new devices.',
  assignmentHistoryTitle: 'Device Assignment History'
}

const CodeStrings = {
  addHeaderTitle: 'Add A New Code Header',
  importTitle: 'Bulk Import Codes',
  importText: 'Use this feature to add multiple codes. Codes cannot be edited here. The first row should include the headers Code Type, Code Name, Code Description. Valid From and Valid To are optional.',
  editableProps: ['code_header_name', 'code_header_title', 'code_header_description']
}

const MapStrings = {
  lastPingLabel: 'Only show last location',
  filterRangeStart: 'Start Date',
  filterRangeEnd: 'End Date',
  filterUserCritterGroup: 'User Animal Group',
}

const MapTileLayers = {
  bing: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  govBase: 'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}'
}

export {
  CodeStrings,
  CollarStrings,
  CritterStrings,
  MapStrings,
  MapTileLayers,
}