const CritterStrings = {
  exportTitle: 'Bulk Export Animal Data',
  exportText: '',
  requiredProps: ['animal_id', 'wlh_id', 'species', 'region'],
  collarAssignmentTitle: 'Assign a device',
  assignCollarBtnText: 'assign selected device',
  assignedTableTitle: 'Animals Attached To A Device',
  unassignedTableTitle: 'Animals Without A Device',
  collarRemovalTitle: 'Confirm device unassignment',
  collarRemovalText: 'Are you sure you wish to unassign this device?',
}

const ImportSteps = [ 
  'Download the template.',
  'Paste the column headers into an Excel spreadsheet',
  'Fill out the rows',
  'Save the file as the CSV format',
  'Click the upload button and select your CSV file',
  'If there were errors during the upload, view them in the error table.',
  'Fix the errors, re-download the file as a CSV and try the upload again',
];

const FileStrings = {
  collarTemplateName: 'BCTW_bulk_import_device_template.csv',
  animalTemplateName: 'BCTW_bulk_import_animal_template.csv',
  bothTemplateName: 'BCTW_import_metadata_template.csv',
  pointTemplateName: 'BCTW_import_historical_telemetry_template.csv',
  templateButtonText: 'Download Template',
}

const WorkflowStrings = {
  captureWorkflowTitle: 'Capture Event Workflow',
  releaseWorkflowTitle: 'Release Event Workflow',
  mortalityWorkflowTitle: 'Mortality Event Workflow',
  mortalityUnassignDeviceTooltip: 'If you unassign the device, no new telemetry from this device will be connected to this animal.',
  locationEventCoordTypeUTM: 'Use UTM',
  locationEventCoordTypeLat: 'Use Lat/Long',
}

const CollarStrings = {
  assignedCollarsTableTitle: 'Assigned Devices',
  availableCollarsTableTitle: 'Unassigned Devices',
  editableProps: ['device_id', 'frequency', 'device_make', 'device_model', 'satellite_network', 'device_status', 'device_type', 'device_deployment_status'],
  requiredProps: ['device_id', 'device_make', 'frequency'],
  exportTitle: 'Bulk Export Device Data',
  exportText: '',
  addCollarTypeTitle: 'Select Device Type',
  addCollarTypeText: 'What type of device would you like to add?',
  addCollarVect: 'Vectronics Device',
  addCollarVHF: 'VHF Device',
  assignmentHistoryByAnimalTitle: 'History of Devices Assigned',
  assignmentHistoryByDeviceTitle: 'History of Animals Assigned',
  collarImportStartMsg: 'What do you want to do?',
  collarImportKeyX: 'Create new Vectronic devices using one or more .keyx files. The .keyx file must be imported before importing Vectronic device metadata via CSV.',
  collarImportDowloadTemplate: 'Download a CSV template for importing device metadata',
  collarImportMetadata: 'Import metadata for existing devices using a .CSV file',
  keyxButtonText: 'Upload KeyX files',
  csvButtonText: 'Upload CSV file',

}

const CodeStrings = {
  addHeaderTitle: 'Add A New Code Header',
  importTitle: 'Bulk Import Codes',
  importText: 'Use this feature to add multiple codes. Codes cannot be edited here. The first row should include the headers Code Type, Code Name, Code Description. Valid From and Valid To are optional.',
}

const MapStrings = {
  startDateLabel: 'Start Date',
  startDateTooltip: 'startDateTooltip',
  endDateLabel: 'End Date',
  endDateTooltip: 'endDateTooltip',
  assignmentStatusLabel: 'Device Assignment Status',
  assignmentStatusOptionA: 'Assigned Devices',
  assignmentStatusOptionU: 'Unassigned Devices',
  assignmentStatusTooltip1: ': shows device telemetry that currently has an animal attached.',
  assignmentStatusTooltip2: ': show device telemetry that does not have an animal attached.',
  assignmentStatusTooltip3: 'To attach a device, click Manage from the top navigation bar and edit an animal.',  
  lastKnownLocationLabel: 'Last Known Location',
  lastKnownLocationTooltip: 'lastKnownLocationTooltip',
  lastFixesLabel: 'Last 10 Fixes',
  lastFixesTooltip: 'lastFixesTooltip',
  deviceListLabel: 'Device List',
  deviceListTooltip: 'deviceListTooltip',
  speciesTooltip: 'speciesTooltip',
  animalStatusTooltip: 'animalStatusTooltip',
  deviceStatusTooltip: 'deviceStatusTooltip',
  sexTooltip: 'sexTooltip',
  customAnimalGroupLabel: 'Custom Animal Group',
  customAnimalGroupLabelTooltip: 'customAnimalGroupLabelTooltip',
  showOnlyCheckedLabel: 'Show Only Checked',
  showOnlyCheckedTooltip: 'showOnlyCheckedTooltip',
  toggleFixesLabel: 'Toggle fixes',
  toggleTracksLabel: 'Toggle tracks',
  drawLineLabel: 'Measure distance',
  drawPolygonLabel: 'Select fixes by drawing a polygon',
  drawRectangleLabel: 'Select fixes by drawing a rectangle',
}

const MapTileLayers = {
  bing: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  govBase: 'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
  esriWorldTopo: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
}

const FormStrings = {
  emptySelectValue: 'Blank',
  validateNegativeLongitude: 'Longitude must be negative',
  validateNumber: 'Must be a number',
  isRequired: 'field is required'
}

const UserAlertStrings = {
  snoozeConfirmation: (remainingCount: number): string => {
    if (remainingCount === 1) {
      return `There is only one snooze remaining! Tomorrow you will be forced to update. Are you sure you want to snooze?`
    }
    return `There are ${remainingCount} snoozes remaining. Are you sure you want to snooze the alert until tomorrow?`;
  },
  noMoreSnoozes: 'Maximum number of snoozes performed, you must perform the alert update',
  mortalityFormTitle: 'Mortality Event',
}

export {
  CodeStrings,
  CollarStrings,
  CritterStrings,
  FileStrings,
  FormStrings,
  MapStrings,
  MapTileLayers,
  UserAlertStrings,
  WorkflowStrings,
  ImportSteps,
}