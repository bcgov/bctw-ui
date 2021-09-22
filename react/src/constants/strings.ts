const CritterStrings = {
  assignCollarBtnText: 'Assign Selected Device',
  assignedTableTitle: 'Animals Attached to a Device',
  collarAssignmentTitle: 'Assign a Device',
  collarRemovalText: (deviceid: number, make: string): string => `Are you sure you wish to remove ${make} device ${deviceid}?`,
  collarRemovalTitle: 'Confirm Device Unassignment',
  exportText: '',
  exportTitle: 'Bulk Export Animal Data',
  unassignedTableTitle: 'Animals Without a Device',
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
  location: {
    coordTypeLatLong: 'Use Lat/Long',
    coordTypeUTM: 'Use UTM',
  },
  mortality: {
    unassignDeviceTooltip: 'If you unassign the device, no new telemetry from this device will be connected to this animal.',
    workflowTitle: 'Mortality Event Workflow',
    exitEarly: 'You have set the animal mortality status to Alive. Do you wish to exit the workflow now?',
  },
  release: {
    workflowTitle: 'Release Event Workflow',
    areUpdates: 'Are there updates to the animal identifiers or characteristics?',
    isNewDevice: 'Are you replacing the original device with a new device?',
    deviceRemovedNotif: 'The previous device has been unassigned from this animal, you must assign a new device to the animal',
  },
  capture: {
    workflowTitle: 'Capture Event Workflow',
    isCaptive: 'Is the animal in a captivity program?',
    whatSpecies: 'What species did you capture?',
    isTransloc: 'Is this animal being translocated to a different location?',
    associated: 'Is this animal is associated with another marked animal?',
    associatedID: 'What is the associated animal’s WLHID?',
    associatedRel: 'What is the relationship of the individual to the captured individual?',
  },
  retrieval: {
    workflowTitle: 'Retrieval Event Workflow',
  },
  malfunction: {
    workflowTitle: 'Malfunction Event Workflow',
  }
}

const CollarStrings = {
  assignedCollarsTableTitle: 'Attached Devices',
  availableCollarsTableTitle: 'Unattached Devices',
  editableProps: ['device_id', 'frequency', 'device_make', 'device_model', 'satellite_network', 'device_status', 'device_type', 'device_deployment_status'],
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
  showOnlyCheckedLabel: 'Show Selected Records Only',
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
}

const EventFormStrings = {
  titles: {
    mortalityTitle: 'Mortality Event',
    retrievalTitle: 'Retrieval Event',
    captureTitle: 'Capture Event',
  },
  animal: {
    mort_captivity_status: 'Did the mortality occur when animal was in the wild (natural range) or in captivity? (e.g., maternity pen, conservation breeding centre)?',
    mort_investigation: 'Was a mortality investigation undertaken?',
    mort_wildlife: 'Was the Wildlife Health Group mortality form completed?',
    mort_predator_pcod: 'Is the PCOD predator species known?',
    mort_predator_ucod: 'Is the UCOD predator species known?',
    captivity: 'Animal is or has been part of a captivity program',
  },
  device: {
    should_unattach: 'Unassign device from animal?',
    vendor_activation: 'Is device still active with vendor?',
    was_retrieved: 'Was the device retrieved?',
    activation_warning: 'contact the vendor to deactivate device to avoid fees',
  }
}

const DataLifeStrings = {
  editWarning: 'Warning: data life fields can only be modified once'
}

export {
  CodeStrings,
  CollarStrings,
  CritterStrings,
  EventFormStrings,
  FileStrings,
  FormStrings,
  MapStrings,
  MapTileLayers,
  UserAlertStrings,
  WorkflowStrings,
  ImportSteps,
  DataLifeStrings,
}