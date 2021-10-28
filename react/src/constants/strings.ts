import { eUserRole } from 'types/user';

const CritterStrings = {
  wlh_id: 'Assigned by Provincial Wildlife Health Group',
  assignCollarBtnText: 'Assign Selected Device',
  assignedTableTitle: 'Animals Attached to a Device',
  collarAssignmentTitle: 'Assign a Device',
  collarRemovalText: (deviceid: number, make: string): string => `Are you sure you wish to remove ${make} device ${deviceid}?`,
  collarRemovalTitle: 'Confirm Device Unassignment',
  exportText: '',
  exportTitle: 'Bulk Export Animal Data',
  unassignedTableTitle: 'Animals Without a Device',
  addTooltip: 'TODO: addTooltip'
}

const ImportSteps = [ 
  'Select the import type',
  'Download the template.',
  'Paste the column headers into an Excel spreadsheet',
  'Fill out the rows',
  'Save the file in CSV format',
  'Click the upload button and select your CSV file',
  'If there were errors during the upload, view them in the error table.',
  'Fix the errors, re-download the file as a CSV and try the upload again',
];


const AnimalDelegationSteps = [
  'Enter a valid email address of the user you wish to give access to',
  'Click Add Email',
  'Click the Edit icon',
  'Choose from a list of animals and permissions from the popup',
  'Click Save',
  'Once complete, click the Submit Permission Request button',
  'An administrator will be notified of the pending request',
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
  captivity: {
    captivity: 'Animal is or has been part of a captivity program',
    isCaptive: 'Is the animal in a captivity program?',
    mort_captivity_status: 'Did the mortality occur when animal was in the wild (natural range) or in captivity? (e.g., maternity pen, conservation breeding centre)?',
  },
  mortality: {
    workflowTitle: 'Mortality Event Workflow',
    unassignDeviceTooltip: 'If you unassign the device, no new telemetry from this device will be connected to this animal.',
    exitEarly: 'You have set the animal mortality status to Alive. Do you wish to exit the workflow now?',
    mort_investigation: 'Was a mortality investigation undertaken?',
    mort_wildlife: 'Was the Wildlife Health Group mortality form completed?',
    mort_predator_pcod: 'Is the PCOD predator species known?',
    mort_predator_ucod: 'Is the UCOD predator species known?',
  },
  release: {
    workflowTitle: 'Release Event Workflow',
    isNewDevice: 'Are you replacing the original device with a new device?',
    deviceRemovedNotif: 'The previous device has been unassigned from this animal, you must assign a new device to the animal',
  },
  capture: {
    workflowTitle: 'Capture Event Workflow',
    areUpdates: 'Are there updates to the animal identifiers or characteristics?',
    shouldReviewNotif: 'Please review the entire metadata for this animal for updates not captured in this form',
    isRecapture: 'Is this a recapture?',
    whatSpecies: 'What species did you capture?',
    isTransloc: 'Is this animal being translocated?',
    isTranslocCompleted: 'Has the translocated animal been released?',
    translocNotif: 'If the animal translocation is not complete, please fill out the Release Event separately when it has',
    associated: 'Is this animal is associated with another marked animal?',
    associatedID: 'What is the associated animal’s WLHID?',
    associatedRel: 'What is the relationship of the individual to the captured individual?',
    beenReleased: 'Has the animal been released?',
    diedDuring: (wf: 'capture' | 'translocation'): string => `Did the animal die during ${wf}?`,
    btnContinueTo: (wf: 'Mortality' | 'Release'): string => `Continue to ${wf} Workflow`,
  },
  retrieval: {
    workflowTitle: 'Retrieval Event Workflow',
  },
  malfunction: {
    workflowTitle: 'Malfunction Event Workflow',
    isMalfunction: 'Is this device malfunctioned or offline?',
    lastTransmission: 'If known, defaults to the last transmission date for this device',
    isActive: 'You have set the device status to Active. Do you wish to exit the workflow now?',
    isRetrieved: 'Did you retrieve the device?',
    wasRetrieved: 'If the device was retrieved, the retrieval workflow form will be opened after',
    statusActive: 'This device is still active',
    statusOffline: 'This device is offline',
    statusMalfunction: 'This device has had a malfunction',
  },
  device: {
    should_unattach: 'Unassign device from animal?',
    vendor_activation: 'Is device still active with vendor?',
    was_retrieved: 'Was the device retrieved?',
    activation_warning: 'contact the vendor to deactivate device to avoid fees',
  }
}

const CollarStrings = {
  assignedCollarsTableTitle: 'Attached Devices',
  availableCollarsTableTitle: 'Unattached Devices',
  editableProps: ['device_id', 'frequency', 'device_make', 'device_model', 'satellite_network', 'device_status', 'device_type', 'device_deployment_status'],
  exportTitle: 'Bulk Export Device Data',
  assignmentHistoryByAnimalTitle: 'History of Devices Assigned',
  assignmentHistoryByDeviceTitle: 'History of Animals Assigned',
  collarImportStartMsg: 'Device import - What do you want to do?',
  collarImportKeyX: 'Import Vectronic .keyx files',
  collarImportDowloadTemplate: 'Download a CSV template for importing device metadata',
  collarImportMetadata: 'Import metadata for existing devices using a .CSV file',
  keyxButtonText: 'Upload .keyx files',
  csvButtonText: 'Upload CSV file',

}

const CodeStrings = {
  addHeaderTitle: 'Add A New Code Header',
  importTitle: 'Bulk Import Codes',
  importText: 'Use this feature to add multiple codes. Codes cannot be edited here. The first row should include the headers Code Type, Code Name, Code Description. Valid From and Valid To are optional.',
}

const MapStrings = {
  startDateLabel: 'Start Date',
  startDateTooltip: 'TODO: startDateTooltip',
  endDateLabel: 'End Date',
  endDateTooltip: 'TODO: endDateTooltip',
  assignmentStatusLabel: 'Device Assignment Status',
  assignmentStatusOptionA: 'Assigned Devices',
  assignmentStatusOptionU: 'Unassigned Devices',
  assignmentStatusTooltip1: ': shows device telemetry that currently has an animal attached.',
  assignmentStatusTooltip2: ': show device telemetry that does not have an animal attached.',
  assignmentStatusTooltip3: 'To attach a device, click Manage from the top navigation bar and edit an animal.',  
  lastKnownLocationLabel: 'Last Known Location',
  lastKnownLocationTooltip: 'TODO: lastKnownLocationTooltip',
  lastFixesLabel: 'Last 10 Fixes',
  lastFixesTooltip: 'TODO: lastFixesTooltip',
  deviceListLabel: 'Device List',
  deviceListTooltip: 'TODO: deviceListTooltip',
  codeFiltersTooltips: {
    species: 'TODO: codeFiltersTooltips.species',
    animal_status: 'TODO: codeFiltersTooltips.animal_status',
    device_status: 'TODO: codeFiltersTooltips.device_status',
    sex: 'TODO: codeFiltersTooltips.sex',
    population_unit: 'TODO: codeFiltersTooltips.population_unit',
  },
  collectiveUnitLabel: 'Collective Unit',
  collectiveUnitTooltip: 'TODO: collectiveUnitTooltip',
  customAnimalGroupLabel: 'Custom Animal Group',
  customAnimalGroupTooltip: 'TODO: customAnimalGroupTooltip',
  showOnlyCheckedLabel: 'Show Selected Records Only',
  showOnlyCheckedTooltip: 'TODO: showOnlyCheckedTooltip',
  toggleFixesLabel: 'Toggle fixes',
  toggleTracksLabel: 'Toggle tracks',
  drawLineLabel: 'Measure distance',
  drawPolygonLabel: 'Select fixes by drawing a polygon',
  drawRectangleLabel: 'Select fixes by drawing a rectangle',
  export: {
    allTime: 'Export the entire history for this selection',
  }
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
  isRequired: ' ', // can't be an empty string
  filterColumnsLabel: 'Search Columns',
}

const UserAlertStrings = {
  alertText: 'Alerts can either be snoozed by clicking the snooze action in the last column, or actioned upon by clicking the edit icon.',
  snoozeConfirmation: (remainingCount: number): string => {
    if (remainingCount === 1) {
      return `There is only one snooze remaining! Tomorrow you will be forced to update. Are you sure you want to snooze?`
    }
    return `There are ${remainingCount} snoozes remaining. Are you sure you want to snooze the alert until tomorrow?`;
  },
  noMoreSnoozes: 'Maximum number of snoozes performed, you must perform the alert update',
}

const DataLifeStrings = {
  editWarning: 'Warning: data life fields can only be modified once'
}

const OnboardStrings = {
  confirmGrant: (username: string, permission: eUserRole): string => `Are you sure you want to grant ${username} the ${permission} role?`,
  denyGrant: (username: string): string =>  `Are you sure you want to deny ${username} access to BCTW?`
}

const UserStrings = {
  deleteWarning: (username: string): string => `Are you sure you want to delete user ${username}?`,
}

export {
  AnimalDelegationSteps,
  CodeStrings,
  CollarStrings,
  CritterStrings,
  DataLifeStrings,
  FileStrings,
  FormStrings,
  ImportSteps,
  MapStrings,
  MapTileLayers,
  OnboardStrings,
  WorkflowStrings,
  UserAlertStrings,
  UserStrings,
}