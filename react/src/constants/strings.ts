import { eUserRole } from 'types/user';
import { pluralize } from 'utils/common_helpers';

const CritterStrings = {
  title: 'Animals',
  wlh_id: 'Assigned by Provincial Wildlife Health Group',
  assignCollarBtnText: 'Assign Selected Device',
  assignedTableTitle: 'Animals Attached to a Device',
  collarAssignmentTitle: 'Attach Collar',
  collarRemovalText: (deviceid: number, make: string): string =>
    `Are you sure you wish to remove ${make} device ${deviceid}?`,
  collarRemovalTitle: 'Confirm Collar Unassignment',
  exportTitle: 'animal_export',
  unassignedTableTitle: 'Animals Without a Collar',
  addTooltip: 'TODO: addTooltip',
  lockedtaxonTooltip: 'Unlock to change taxon. Warning potential data loss.',
  unlockedtaxonTooltip: 'Lock taxon selection',
  menuItems: {
    edit: 'Edit',
    map: 'Show on Map',
    mortality: 'Report Mortality',
    removeCollar: 'Remove Collar',
    attach: 'Attach Collar'
  },
  collaredAnimals: 'Collared Animals',
  nonCollaredAnimals: 'Non-collared Animals',
  manageMyAnimals: 'Manage my Animals'
};

const LatestDataRetrieval = {
  title: 'Latest Data Retrieval',
  success: 'We successfully retrieved data from all your devices in our latest attempt.',
  failure: 'We failed to retrieve data from one or more of your devices in our latest attempt.'
};

const QuickSummaryStrings = {
  title: 'Quick Summary',
  manage: 'Managed Animals',
  observed: 'Observed Animals',
  editable: 'Editable Animals'
};

const ImportSteps = [
  'Select the import type',
  'Download the template.',
  'Paste the column headers into an Excel spreadsheet',
  'Fill out the rows',
  'Save the file in CSV format',
  'Click the upload button and select your CSV file',
  'If there were errors during the upload, view them in the error table.',
  'Fix the errors, re-download the file as a CSV and try the upload again'
];

const AnimalDelegationSteps = [
  'Enter a valid email address of the user you wish to give access to',
  'Click Add Email',
  'Click the Edit icon',
  'Choose from a list of animals and permissions from the popup',
  'Click Save',
  'Once complete, click the Submit Permission Request button',
  'An administrator will be notified of the pending request'
];

const FileStrings = {
  collarTemplateName: 'BCTW_bulk_import_device_template.csv',
  animalTemplateName: 'BCTW_bulk_import_animal_template.csv',
  bothTemplateName: 'BCTW_import_metadata_template.csv',
  pointTemplateName: 'BCTW_import_historical_telemetry_template.csv',
  templateButtonText: 'Download Template'
};

const BannerStrings = {
  getNotifications: (n: number): string => `${n} ${pluralize(n, 'Notification')}`,
  exportDetails: [
    'Use Quick Export to quickly get telemetry data for any of your animals.',
    'Use Advanced Export to get data that matches custom query parameters.'
  ],
  vectronicKeyxInfo: 'Vectronic collars must be validated with KeyX files before BCTW can collect telemetry data'
};

const WorkflowStrings = {
  location: {
    coordTypeLatLong: 'Use Lat/Long',
    coordTypeUTM: 'Use UTM'
  },
  captivity: {
    captivity: 'Animal is or has been part of a captivity program',
    isCaptive: 'Is the animal in a captivity program?',
    mort_captivity_status:
      'Did the mortality occur when animal was in the wild (natural range) or in captivity? (e.g., maternity pen, conservation breeding centre)?'
  },
  mortality: {
    workflowTitle: 'Mortality Event Workflow',
    unassignDeviceTooltip:
      'If you unassign the device, no new telemetry from this device will be connected to this animal.',
    exitEarly: 'You have set the animal mortality status to Alive. Do you wish to exit the workflow now?',
    mort_investigation: 'Was a mortality investigation undertaken?',
    mort_wildlife: 'Was the Wildlife Health Group mortality form completed?',
    mort_predator_pcod: 'Is the PCOD predator taxon known?',
    mort_predator_ucod: 'Is the UCOD predator taxon known?'
  },
  release: {
    workflowTitle: 'Release Event Workflow',
    isNewDevice: 'Are you replacing the original device with a new device?',
    deviceRemovedNotif:
      'The previous device has been unassigned from this animal, you must assign a new device to the animal'
  },
  capture: {
    workflowTitle: 'Capture Event Workflow',
    areUpdates: 'Are there updates to the animal identifiers or characteristics?',
    shouldReviewNotif: 'Please review the entire metadata for this animal for updates not captured in this form',
    isRecapture: 'Is this a recapture?',
    isTransloc: 'Is this animal being translocated?',
    isTranslocCompleted: 'Has the translocated animal been released?',
    translocNotif:
      'If the animal translocation is not complete, please fill out the Release Event separately when it has',
    associated: 'Is this animal is associated with another marked animal?',
    associatedID: 'What is the associated animal’s WLHID?',
    associatedRel: 'What is the relationship of the individual to the captured individual?',
    beenReleased: 'Has the animal been released?',
    diedDuring: (wf: 'capture' | 'translocation_ind'): string => `Did the animal die during ${wf}?`,
    btnContinueTo: (wf: 'Mortality' | 'Release'): string => `Continue to ${wf} Workflow`
  },
  retrieval: {
    workflowTitle: 'Retrieval Event Workflow'
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
    statusMalfunction: 'This device has had a malfunction'
  },
  device: {
    should_unattach: 'Unassign device from animal?',
    vendor_activation: 'Is device still active with vendor?',
    was_retrieved: 'Was the device retrieved?',
    activation_warning: 'contact the vendor to deactivate device to avoid fees'
  }
};

const CollarStrings = {
  assignedCollarsTableTitle: 'Attached Devices',
  availableCollarsTableTitle: 'Unattached Devices',
  editableProps: [
    'device_id',
    'frequency',
    'device_make',
    'device_model',
    'satellite_network',
    'device_status',
    'device_type',
    'device_deployment_status'
  ],
  exportTitle: 'device_export',
  assignmentHistoryByAnimalTitle: 'Collars History',
  assignmentHistoryByDeviceTitle: 'History of Animals Assigned',
  collarImportStartMsg: 'Device import - What do you want to do?',
  collarImportKeyX: 'Import Vectronic .keyx files',
  collarImportDowloadTemplate: 'Download a CSV template for importing device metadata',
  collarImportMetadata: 'Import metadata for existing devices using a .CSV file',
  keyxButtonText: 'Upload .keyx files',
  csvButtonText: 'Upload CSV file'
};

const CodeStrings = {
  addHeaderTitle: 'Add A New Code Header',
  importTitle: 'Bulk Import Codes',
  importText:
    'Use this feature to add multiple codes. Codes cannot be edited here. The first row should include the headers Code Type, Code Name, Code Description. Valid From and Valid To are optional.'
};

const MapStrings = {
  startDateLabel: 'Start Date',
  startDateTooltip: 'Start date for telemetry fetch',
  endDateLabel: 'End Date',
  endDateTooltip: 'End date for telemetry fetch',
  assignmentStatusLabel: 'Device Assignment Status',
  assignmentStatusOptionA: 'Assigned Devices',
  assignmentStatusOptionU: 'Unassigned Devices',
  assignmentStatusTooltip1: ': shows device telemetry that currently has an animal attached.',
  assignmentStatusTooltip2: ': show device telemetry that does not have an animal attached.',
  assignmentStatusTooltip3: 'To attach a device, click Manage from the top navigation bar and edit an animal.',
  lastKnownLocationLabel: 'Last Known Location',
  lastKnownLocationTooltip: 'Shows last know point',
  lastFixesLabel: 'Last 10 Fixes',
  lastFixesTooltip: 'Show only last 10 fixes',
  deviceListLabel: 'Device List',
  deviceListTooltip: 'Filter for specific device within date range',
  codeFiltersTooltips: {
    device_id: 'Filter for specific device within date range',
    taxon: 'Select taxon to filter',
    critter_status: 'Animal status filter',
    device_status: 'Device status filter',
    sex: 'Filter critter sex',
    collection_unit: 'Filter by population unit',
    collective_unit: 'Filter by collection unit'
  },
  collectiveUnitLabel: 'Collective Unit',
  collectiveUnitTooltip: 'Filter by collection unit ',
  customAnimalGroupLabel: 'Custom Animal Group',
  customAnimalGroupTooltip: 'Filter by existing animal group, or click pencil to create one',
  showOnlyCheckedLabel: 'Show Selected Records Only',
  showOnlyCheckedTooltip: 'Show only selected records in attribute table',
  toggleFixesLabel: 'Toggle fixes',
  toggleTracksLabel: 'Toggle tracks',
  drawLineLabel: 'Measure distance',
  drawPolygonLabel: 'Select fixes by drawing a polygon',
  drawRectangleLabel: 'Select fixes by drawing a rectangle',
  export: {
    allTime: 'Export the entire history for this selection'
  },
  noCrittersFound: 'No telemetry found within this date range. Try adjusting the date range in the filter panel.',
  mapPanels: {
    subTitle: {
      Search: '',
      Filter: '',
      Symbolize: ''
    }
  }
};

const MapTileLayers = {
  bing: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  govBase: 'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
  esriWorldTopo: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
};

const FormStrings = {
  emptySelectValue: 'Blank',
  validateNegativeLongitude: 'Longitude must be negative',
  validateNumber: 'Must be a number',
  isRequired: ' ', // can't be an empty string
  filterColumnsLabel: 'Search Columns'
};

const UserAlertStrings = {
  alertText:
    'Alerts can either be snoozed by clicking the snooze action in the last column, or actioned upon by clicking the edit icon.',
  snoozeConfirmation: (remainingCount: number): string => {
    if (remainingCount === 1) {
      return `There is only one snooze remaining! Tomorrow you will be forced to update. Are you sure you want to snooze?`;
    }
    return `There are ${remainingCount} snoozes remaining. Are you sure you want to snooze the alert until tomorrow?`;
  },
  noMoreSnoozes: 'Maximum number of snoozes performed, you must perform the alert update'
};

const DataLifeStrings = {
  editWarning: 'Warning: data life fields can only be modified once'
};

const OnboardStrings = {
  confirmGrant: (username: string, permission: eUserRole): string =>
    `Are you sure you want to grant ${username} the ${permission} role?`,
  denyGrant: (username: string): string => `Are you sure you want to deny ${username} access to BCTW?`
};

const UserStrings = {
  deleteWarning: (username: string): string => `Are you sure you want to delete user ${username}?`
};
const HomePageStrings = {
  welcome: `Welcome to the BC Telemetry Warehouse (BCTW). The BCTW is an application and database to manage and store the
          Province of British Columbia’s wildlife telemetry observations to support informed management decisions and
          improve conservation efforts.`,
  support: {
    title: 'Need Support?',
    data: [
      {
        textPrefix: 'For support, please contact ',
        link: 'bctw@gov.bc.ca',
        href: 'mailto:bctw@gov.bc.ca'
      }
    ]
  },
  resources: {
    title: 'Other Resources',
    data: [
      {
        textPrefix: 'Search for ',
        link: 'wildlife data and information',
        href: 'https://www.gov.bc.ca/wildlife-taxon-information'
      },
      {
        textPrefix: 'Use the ',
        textSuffix:
          ' to access publicly available telemetry data layers derived from the BC Telemetry Warehouse and Wildlife taxon Inventory (SPI) database for desktop GIS analyses.',
        link: 'DataBC Data Catalogue',
        href: 'https://catalogue.data.gov.bc.ca/dataset?q=wsi&download_audience=Public&sort=score+desc%2C+record_publish_date+desc'
      }
    ]
  }
};

const ExportStrings = {
  infoBannerMesgs: [
    'Use Quick Export to quickly get telemetry data for any of your animals.',
    'Use Advanced Export to get data that matches custom query parameters.'
  ],
  quickTabLabel: 'Quick Export',
  advancedTabLabel: 'Advanced Export',
  checkboxLabel: 'All Telemetry',
  dateRangeHeader: 'Select Date Range',
  animalTableHeader: 'Select Attached Animals',
  queryBuilderHeader: 'Build Query',
  locationSelectHeader: 'Select Location',
  modal: {
    noTelemetryWarning: 'No telemetry data found. Try expanding your search or choosing different dates.',
    telemetrySuccessMsg: 'Successfully exported telemetry.',
    modalTitle: 'Confirm Export Download',
    csvButton: 'Export Data as CSV',
    csvButtonLoad: 'Exporting CSV...',
    kmlButton: 'Export Data as KML',
    kmlButtonLoad: 'Exporting KML...'
  },
  allTelemetryButton: 'All Telemetry',
  mostRecentTelemetryButton: 'Last Known Location',
  attachedAnimalsOnlyCheck: 'Ongoing Deployments Only'
};

const ImportStrings = {
  importToolHeader: 'Animal+Device Metadata and Telemetry',
  uploadButton: 'Upload Animal+Device/Telemetry Template',
  downloadButton: 'Download Template',
  validValuesModal: 'Valid values for this field',
  checkboxLabel: 'Hide Empty Columns',
  successBanner:
    "Your spreadsheet appears to be ready for submission. Press the 'Finalize Submission' button at the bottom of the page to import your data.",
  warningBanner:
    'Importing this data may have unintended effects. You must confirm that you understand each item below will be actioned before you finalize your import.',
  errorBanner:
    'Hover over highlighted cells to view error info. Fix these errors in your spreadsheet application and re-upload.',
  detailBannerIdle: 'Click a cell for detailed information on that error.',
  ['Animal and Device']: [
    'To add a new animal and collar, create a new row in the Device Metadata template and fill out the required fields.',
    'Device IDs already assigned to an Animal ID must first be released by their owner before they can be assigned to a new Animal ID.'
  ],
  ['Telemetry']: [
    'Telemetry import used for missing Telemetry of existing tracked vendor devices',
    'Placeholder for additional text'
  ],
  ['Vectronic KeyX']: 'placeholder',
  templateFileName: 'bctw_data_import_template.xlsx'
};

const DelegationRequestStrings = {
  confirmDenyMesg: `Are you sure you wish to deny this permission request?`,
  confirmGrantMesg: `Are you sure you wish to accept this permission request?`,
  confirmDenyMesgMulti: (len: number): string =>
    `Are you sure you wish to deny each of the ${len} permission requests?`,
  confirmGrantMesgMulti: (len: number): string =>
    `Are you sure you wish to accept each of the ${len} permission requests?`
};
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
  HomePageStrings,
  DelegationRequestStrings,
  BannerStrings,
  ExportStrings,
  ImportStrings,
  LatestDataRetrieval,
  QuickSummaryStrings
};
