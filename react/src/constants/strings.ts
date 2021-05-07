const CritterStrings = {
  importTitle: 'Bulk Import Animals',
  importText: 'Use this feature to add or update animals. If "animal_id" AND "wlh_id" are present, the importer will consider it an existing animal and attempt to update it. If "device_id" is present, the importer will attempt to attach the collar to the device. The device must exist.',
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

const FileStrings = {
  collarTemplateName: 'BCTW_bulk_import_device_template.csv',
  animalTemplateName: 'BCTW_bulk_import_animal_template.csv',
  templateButtonText: 'Download Template',
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
  assignmentHistoryTitle: 'Device Assignment History',
  collarImportStartMsg: 'What do you want to do?',
  collarImportKeyX: 'Create new Vectronic devices using .keyx file(s)',
  collarImportDowloadTemplate: 'Download a CSV template for importing device metadata',
  collarImportMetadata: 'Import metadata for existing devices using a .CSV file',
}

const CodeStrings = {
  addHeaderTitle: 'Add A New Code Header',
  importTitle: 'Bulk Import Codes',
  importText: 'Use this feature to add multiple codes. Codes cannot be edited here. The first row should include the headers Code Type, Code Name, Code Description. Valid From and Valid To are optional.',
  editableProps: ['code_header_name', 'code_header_title', 'code_header_description']
}

const MapStrings = {
  lastPingLabel: 'Last Known Location',
  lastFixesLabel: 'Last 10 Fixes',
  onlySelectedLabel: 'Show Only Checked',
  filterRangeStart: 'Start Date',
  filterRangeEnd: 'End Date',
  filterUserCritterGroup: 'Custom Animal Group',
  deviceSelectedLabel: 'Device List',
  assignmentStatusLabel: 'Device Assignment Status',
  assignmentStatusOptionA: 'Assigned Devices',
  assignmentStatusOptionU: 'Unassigned Devices',
  assignmentStatusTooltip1: ': shows device telemetry that currently has an animal attached.',
  assignmentStatusTooltip2: ': show device telemetry that does not have an animal attached.',
  assignmentStatusTooltip3: 'To attach a device, click Manage from the top navigation bar and edit an animal.',
}

const MapTileLayers = {
  bing: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  govBase: 'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}'
}

const FormStrings = {
  emptySelectValue: 'Blank',
}

const UserAlertStrings = {
  dimissAlert: 'Are you sure you want to dismiss this alert?',
  mortalityFormTitle: 'Mortality Event',
}

export {
  CodeStrings,
  CollarStrings,
  CritterStrings,
  FormStrings,
  MapStrings,
  MapTileLayers,
  FileStrings,
  UserAlertStrings,
}